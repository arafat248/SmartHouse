from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from apps.households.models import Household, HouseholdMember
from apps.expenses.models import Expense
from apps.meals.models import Meal
from apps.deposits.models import Deposit
from .models import Settlement, SettlementItem

class SettlementCalculator:
    @staticmethod
    @transaction.atomic
    def generate_settlement(household_id: int, month: int, year: int) -> Settlement:
        household = Household.objects.get(id=household_id)
        
        # Check if finalized exists
        if Settlement.objects.filter(household=household, month=month, year=year, status__in=[Settlement.STATUS_FINALIZED, Settlement.STATUS_CLOSED]).exists():
            raise ValueError("A finalized settlement already exists for this month and year.")
        
        # Delete any existing draft for this month/year
        Settlement.objects.filter(household=household, month=month, year=year, status=Settlement.STATUS_DRAFT).delete()
        
        settlement = Settlement.objects.create(
            household=household,
            month=month,
            year=year,
            status=Settlement.STATUS_DRAFT
        )

        members = HouseholdMember.objects.filter(household=household, status=HouseholdMember.STATUS_ACTIVE)
        
        # Calculate Total Expenses
        # We classify Groceries and Market as Meal Costs, rest as Other Costs.
        expenses = Expense.objects.filter(household=household, expense_date__year=year, expense_date__month=month)
        
        meal_expenses = expenses.filter(category__name__in=['Groceries', 'Market'])
        other_expenses = expenses.exclude(category__name__in=['Groceries', 'Market'])
        
        total_meal_expense = meal_expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_other_expense = other_expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        settlement.total_expense = total_meal_expense + total_other_expense
        
        # Calculate Total Meals
        meals = Meal.objects.filter(household=household, date__year=year, date__month=month)
        
        member_meals = {}
        total_meals = Decimal('0.00')
        
        for m in members:
            member_meals[m.id] = Decimal('0.00')
            
        for meal in meals:
            if meal.member_id in member_meals:
                member_meals[meal.member_id] += meal.total_meals
            total_meals += meal.total_meals
            
        settlement.total_meals = total_meals
        
        # Calculate Meal Rate
        meal_rate = Decimal('0.0000')
        if total_meals > Decimal('0.00'):
            meal_rate = total_meal_expense / total_meals
            
        settlement.meal_rate = meal_rate
        settlement.save()
        
        # Other cost per member (split equally)
        num_members = members.count()
        other_cost_per_member = Decimal('0.00')
        if num_members > 0:
            other_cost_per_member = total_other_expense / num_members
            
        # Calculate Deposits per member
        deposits = Deposit.objects.filter(household=household, deposit_date__year=year, deposit_date__month=month)
        member_deposits = {}
        for d in deposits:
            if d.member_id not in member_deposits:
                member_deposits[d.member_id] = Decimal('0.00')
            member_deposits[d.member_id] += d.amount
            
        # Also, if a member PAID for an expense out of their pocket, we should credit them.
        # Wait, the prompt says "Total Deposit". Usually in such systems, expenses paid by member are added to their total deposit/contribution.
        # Let's add their paid expenses to their total_deposit (i.e. total_contribution).
        for e in expenses:
            if e.paid_by_id not in member_deposits:
                member_deposits[e.paid_by_id] = Decimal('0.00')
            member_deposits[e.paid_by_id] += e.amount

        # Create Items
        for m in members:
            m_meals = member_meals.get(m.id, Decimal('0.00'))
            m_meal_cost = m_meals * meal_rate
            m_other_cost = other_cost_per_member
            m_total_cost = m_meal_cost + m_other_cost
            m_total_deposit = member_deposits.get(m.id, Decimal('0.00'))
            m_balance = m_total_deposit - m_total_cost
            
            SettlementItem.objects.create(
                settlement=settlement,
                member=m,
                total_meals=m_meals,
                meal_cost=m_meal_cost,
                other_cost=m_other_cost,
                total_cost=m_total_cost,
                total_deposit=m_total_deposit,
                balance=m_balance
            )
            
        return settlement

    @staticmethod
    def calculate_suggested_transfers(settlement: Settlement):
        items = list(settlement.items.all())
        
        debtors = []
        creditors = []
        
        for item in items:
            # Format balance to 2 decimal places properly
            # Small fractional differences can occur.
            balance = round(float(item.balance), 2)
            if balance < -0.01:
                debtors.append({'member': item.member, 'amount': -balance})
            elif balance > 0.01:
                creditors.append({'member': item.member, 'amount': balance})
                
        # Sort by amount descending to minimize transactions
        debtors.sort(key=lambda x: x['amount'], reverse=True)
        creditors.sort(key=lambda x: x['amount'], reverse=True)
        
        transfers = []
        
        i, j = 0, 0
        while i < len(debtors) and j < len(creditors):
            debtor = debtors[i]
            creditor = creditors[j]
            
            amount = min(debtor['amount'], creditor['amount'])
            
            transfers.append({
                'from_member': debtor['member'].id,
                'from_member_name': f"{debtor['member'].user.first_name} {debtor['member'].user.last_name}",
                'to_member': creditor['member'].id,
                'to_member_name': f"{creditor['member'].user.first_name} {creditor['member'].user.last_name}",
                'amount': round(amount, 2)
            })
            
            debtors[i]['amount'] -= amount
            creditors[j]['amount'] -= amount
            
            if debtors[i]['amount'] < 0.01:
                i += 1
            if creditors[j]['amount'] < 0.01:
                j += 1
                
        return transfers
