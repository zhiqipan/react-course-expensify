import React from 'react';
import { shallow } from 'enzyme';
import { AddExpensePage } from '../../components/AddExpensePage';
import expenses from '../fixtures/expenses';

let startAddExpense,
  history,
  wrapper;

beforeEach(() => {
  startAddExpense = jest.fn();
  history = { push: jest.fn() };
  wrapper = shallow(<AddExpensePage startAddExpense={startAddExpense} history={history} />);
});

it('should render AddExpensePage correctly', () => {
  expect(wrapper).toMatchSnapshot();
});

it('should handle on submit', () => {
  wrapper.find('ExpenseForm').prop('onSubmit')(expenses[0]);
  expect(startAddExpense).toHaveBeenLastCalledWith(expenses[0]);
  expect(history.push).toHaveBeenLastCalledWith('/dashboard');
});

