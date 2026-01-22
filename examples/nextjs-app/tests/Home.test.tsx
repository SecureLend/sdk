import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

// Mock the SecureLend hooks to provide controlled data and states
jest.mock('@securelend/react', () => ({
  ...jest.requireActual('@securelend/react'),
  useLoanComparison: () => ({
    compare: jest.fn(),
    data: null,
    widget: null,
    loading: false,
    error: null,
  }),
  useDisplayOfferForm: () => ({
    displayForm: jest.fn(),
    data: null,
    loading: false,
    error: null,
  }),
}));

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading', {
      name: /Business Loan Comparison/i,
    });
    
    expect(heading).toBeInTheDocument();
  });

  it('renders the form with input fields and a button', () => {
    render(<Home />);
    
    expect(screen.getByPlaceholderText('Loan Amount')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Loan Purpose')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compare Loans/i })).toBeInTheDocument();
  });
});
