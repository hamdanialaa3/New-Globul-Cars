/**
 * Financing Calculator Service
 * Calculates monthly payments, total interest, amortization schedules
 * Location: Bulgaria | Currency: EUR
 * 
 * File: src/services/financing/financing-calculator.service.ts
 * Created: February 8, 2026
 */

import { serviceLogger } from '../logger-service';

export interface FinancingRequest {
  carPrice: number;
  downPayment: number;
  durationMonths: number;
  annualInterestRate: number;
}

export interface MonthlyPayment {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface FinancingCalculation {
  loanAmount: number;
  downPayment: number;
  carPrice: number;
  durationMonths: number;
  annualInterestRate: number;
  monthlyRate: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationSchedule: MonthlyPayment[];
  effectiveAnnualRate: number;
}

class FinancingCalculatorService {
  private static instance: FinancingCalculatorService;

  private constructor() {}

  static getInstance(): FinancingCalculatorService {
    if (!FinancingCalculatorService.instance) {
      FinancingCalculatorService.instance = new FinancingCalculatorService();
    }
    return FinancingCalculatorService.instance;
  }

  calculate(request: FinancingRequest): FinancingCalculation {
    try {
      const loanAmount = request.carPrice - request.downPayment;

      if (loanAmount <= 0) {
        throw new Error('Loan amount must be positive (car price > down payment)');
      }

      if (request.durationMonths <= 0) {
        throw new Error('Duration must be positive');
      }

      if (request.annualInterestRate < 0) {
        throw new Error('Interest rate cannot be negative');
      }

      const monthlyRate = request.annualInterestRate / 100 / 12;
      const monthlyPayment = this.calculateMonthlyPayment(
        loanAmount,
        monthlyRate,
        request.durationMonths
      );

      const amortizationSchedule = this.generateAmortizationSchedule(
        loanAmount,
        monthlyRate,
        request.durationMonths,
        monthlyPayment
      );

      const totalPayment = monthlyPayment * request.durationMonths;
      const totalInterest = totalPayment - loanAmount;

      const effectiveAnnualRate = this.calculateEffectiveAnnualRate(
        request.annualInterestRate,
        monthlyRate
      );

      const result: FinancingCalculation = {
        loanAmount,
        downPayment: request.downPayment,
        carPrice: request.carPrice,
        durationMonths: request.durationMonths,
        annualInterestRate: request.annualInterestRate,
        monthlyRate: monthlyRate * 100,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        amortizationSchedule,
        effectiveAnnualRate: Math.round(effectiveAnnualRate * 100) / 100
      };

      serviceLogger.info('Financing calculated', { carPrice: request.carPrice, loanAmount });

      return result;
    } catch (error) {
      serviceLogger.error('Financing calculation failed', error as Error, request);
      throw error;
    }
  }

  private calculateMonthlyPayment(
    principal: number,
    monthlyRate: number,
    months: number
  ): number {
    if (monthlyRate === 0) {
      return principal / months;
    }

    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;

    return principal * (numerator / denominator);
  }

  private generateAmortizationSchedule(
    loanAmount: number,
    monthlyRate: number,
    durationMonths: number,
    monthlyPayment: number
  ): MonthlyPayment[] {
    const schedule: MonthlyPayment[] = [];
    let balance = loanAmount;

    for (let month = 1; month <= durationMonths; month++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;

      const roundedBalance = Math.max(0, Math.round(balance * 100) / 100);

      schedule.push({
        month,
        payment: Math.round(monthlyPayment * 100) / 100,
        principal: Math.round(principal * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        balance: roundedBalance
      });

      if (roundedBalance === 0) {
        break;
      }
    }

    return schedule;
  }

  private calculateEffectiveAnnualRate(
    annualRate: number,
    monthlyRate: number
  ): number {
    return (Math.pow(1 + monthlyRate, 12) - 1) * 100;
  }

  calculateLoanAmount(carPrice: number, downPaymentPercent: number): number {
    return carPrice * (1 - downPaymentPercent / 100);
  }

  calculateDownPayment(carPrice: number, downPaymentPercent: number): number {
    return carPrice * (downPaymentPercent / 100);
  }

  calculateMonthlyFromTotal(totalAmount: number, durationMonths: number): number {
    return Math.round((totalAmount / durationMonths) * 100) / 100;
  }

  isAffordable(monthlyIncome: number, monthlyPayment: number, debtRatio: number = 0.35): boolean {
    const maxMonthlyPayment = monthlyIncome * debtRatio;
    return monthlyPayment <= maxMonthlyPayment;
  }

  getAffordableCarPrice(monthlyIncome: number, monthlyRate: number, durationMonths: number, downPaymentPercent: number = 20): number {
    const maxMonthlyPayment = monthlyIncome * 0.35;
    const loanAmount = this.getMaxLoan(maxMonthlyPayment, monthlyRate, durationMonths);
    const downPayment = loanAmount * (downPaymentPercent / (100 - downPaymentPercent));

    return loanAmount + downPayment;
  }

  private getMaxLoan(monthlyPayment: number, monthlyRate: number, durationMonths: number): number {
    if (monthlyRate === 0) {
      return monthlyPayment * durationMonths;
    }

    const denominator = monthlyRate * Math.pow(1 + monthlyRate, durationMonths);
    const numerator = Math.pow(1 + monthlyRate, durationMonths) - 1;

    return monthlyPayment * (numerator / denominator);
  }

  compareFinancingOptions(
    carPrice: number,
    downPayment: number,
    optionsList: Array<{ durationMonths: number; annualInterestRate: number; bankName: string }>
  ): Array<FinancingCalculation & { bankName: string }> {
    return optionsList.map(option => {
      const calculation = this.calculate({
        carPrice,
        downPayment,
        durationMonths: option.durationMonths,
        annualInterestRate: option.annualInterestRate
      });

      return {
        ...calculation,
        bankName: option.bankName
      };
    });
  }
}

export const financingCalculatorService = FinancingCalculatorService.getInstance();
