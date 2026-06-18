import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  private locators = {
    usernameInput: '#username',
    passwordInput: '#password',
    loginButton: '#login-button',
    errorMessage: '.error-message',
    forgotPasswordLink: 'a:has-text("Forgot Password")',
    rememberMeCheckbox: '#remember-me',
    signUpLink: 'a:has-text("Sign Up")',
  };

  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin(url?: string): Promise<void> {
    const loginUrl = url || process.env.BASE_URL || 'http://localhost:3000/login';
    await this.navigate(loginUrl);
  }

  async enterUsername(username: string): Promise<void> {
    await this.fill(this.locators.usernameInput, 'username', username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.fill(this.locators.passwordInput, 'password', password);
  }

  async clickLoginButton(): Promise<void> {
    await this.click(this.locators.loginButton, 'Login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  async clickRememberMe(): Promise<void> {
    await this.click(this.locators.rememberMeCheckbox, 'Remember Me');
  }

  async clickForgotPassword(): Promise<void> {
    await this.click(this.locators.forgotPasswordLink, 'Forgot Password');
  }

  async clickSignUp(): Promise<void> {
    await this.click(this.locators.signUpLink, 'Sign Up');
  }

  async getErrorMessage(): Promise<string> {
    return await this.getText(this.locators.errorMessage);
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.locators.errorMessage);
  }

  getLocator(elementName: keyof typeof this.locators): string {
    return this.locators[elementName];
  }
}
