import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  addExpense,
  editExpense,
  removeExpense,
  setExpenses,
  startAddExpense,
  startSetExpenses,
  startRemoveExpense,
  startEditExpense,
} from '../../actions/expenses';
import expenses from '../fixtures/expenses';
import firebase from '../../firebase/firebase';

const database = firebase.database();
const uid = 'this_is_my_test_uid';
const defaultAuthState = { auth: { uid } };
const createMockStore = configureMockStore([thunk]);

beforeEach((done) => {
  const expensesData = {};
  expenses.forEach((expense) => {
    const {
      id, description, note, amount, createdAt,
    } = expense;

    expensesData[id] = {
      description, note, amount, createdAt,
    };
  });
  database.ref(`users/${uid}/expenses`).set(expensesData).then(() => done());
});

it('should setup remove expense action object', () => {
  const action = removeExpense('abc123');
  expect(action).toEqual({
    type: 'REMOVE_EXPENSE',
    id: 'abc123',
  });
});

it('should setup edit expense action object', () => {
  const action = editExpense('abc123', {
    description: 'description',
    note: 'note',
    amount: 123,
  });
  expect(action).toEqual({
    type: 'EDIT_EXPENSE',
    id: 'abc123',
    updates: {
      description: 'description',
      note: 'note',
      amount: 123,
    },
  });
});

it('should setup add expense action object with provided values', () => {
  const action = addExpense(expenses[2]);

  expect(action).toEqual({
    type: 'ADD_EXPENSE',
    expense: expenses[2],
  });
});

it('should add expense to database and store', () => {
  const store = createMockStore(defaultAuthState);
  const expenseData = {
    description: 'Mouse',
    amount: 80,
    note: 'This one is better',
    createdAt: 1000,
  };

  expect.assertions(2);

  return store.dispatch(startAddExpense(expenseData))
    .then(() => {
      const actions = store.getActions();
      expect(actions[0]).toEqual({
        type: 'ADD_EXPENSE',
        expense: {
          id: expect.any(String),
          ...expenseData,
        },
      });

      return database.ref(`users/${uid}/expenses/${actions[0].expense.id}`).once('value');
    })
    .then((snapshot) => {
      expect(snapshot.val()).toEqual(expenseData);
    });
});

it('should add expense with defaults to database and store', () => {
  const store = createMockStore(defaultAuthState);
  const expenseDefaults = {
    description: '',
    note: '',
    amount: 0,
    createdAt: 0,
  };

  expect.assertions(2);

  return store.dispatch(startAddExpense())
    .then(() => {
      const actions = store.getActions();
      expect(actions[0]).toEqual({
        type: 'ADD_EXPENSE',
        expense: {
          id: expect.any(String),
          ...expenseDefaults,
        },
      });

      return database.ref(`users/${uid}/expenses/${actions[0].expense.id}`).once('value');
    })
    .then((snapshot) => {
      expect(snapshot.val()).toEqual(expenseDefaults);
    });
});

it('should setup set expenses action object', () => {
  const action = setExpenses(expenses);
  expect(action).toEqual({
    type: 'SET_EXPENSES',
    expenses,
  });
});

it('should fetch the expenses from firebase', () => {
  const store = createMockStore(defaultAuthState);

  expect.assertions(1);

  return store.dispatch(startSetExpenses())
    .then(() => database.ref(`users/${uid}/expenses`).once('value'))
    .then((snapshot) => {
      const actions = store.getActions();
      const fetchedExpenses = [];
      snapshot.forEach((childSnapshot) => {
        fetchedExpenses.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      expect(actions[0]).toEqual({
        type: 'SET_EXPENSES',
        expenses: fetchedExpenses,
      });
      /*
      * No need to check state,
      * as changing state is reducer's responsibility
      * // expect(store.getState()).toEqual(expenses);
      */
    });
});

it('should remove an expense from firebase', () => {
  const store = createMockStore(defaultAuthState);
  const { id } = expenses[0];
  expect.assertions(2);
  return store.dispatch(startRemoveExpense(id))
    .then(() => {
      const actions = store.getActions();
      expect(actions[0]).toEqual({
        type: 'REMOVE_EXPENSE',
        id,
      });
      return database.ref(`users/${uid}/expenses/${id}`).once('value');
    })
    .then((snapshot) => {
      expect(snapshot.val()).toBeFalsy();
    });
});

it('should edit an expense from firebase', () => {
  const store = createMockStore(defaultAuthState);
  const { id } = expenses[0];
  const updates = { amount: 99887712345 };
  expect.assertions(2);
  return store.dispatch(startEditExpense(id, updates))
    .then(() => {
      const actions = store.getActions();
      expect(actions[0]).toEqual({
        type: 'EDIT_EXPENSE',
        id,
        updates,
      });
      return database.ref(`users/${uid}/expenses/${id}`).once('value');
    })
    .then((snapshot) => {
      expect(snapshot.val().amount).toEqual(updates.amount);
    });
});
