import * as puppeteer from 'puppeteer';
import { CaseData } from './data';

export interface BotStatusUpdater {
  (
    botId: string,
    status: 'processing' | 'failed' | 'complete',
    statusMessage: string,
    eFileUrl?: string,
  ): Promise<any>;
}

export class Bot {
  browser: puppeteer.Browser;
  page: puppeteer.Page;

  constructor(browser: puppeteer.Browser, page: puppeteer.Page) {
    this.browser = browser;
    this.page = page;
  }

  async run(caseData: CaseData) {
    // Open browser
    await this.goToURL(
      'https://oregon.tylerhost.net/OfsWeb/FileAndServeModule',
    );
    console.log('Browser opened');

    // Log in
    await this.logIn('marcel@aton-law.com', 'Aton1234');
    console.log('Logged in');

    //Start New Case
    await this.page.waitForNavigation();
    await this.page.waitFor(2000);
    await this.startCase();
    console.log('New case started');

    // Continue past modal
    await this.page.waitFor(2000);
    await this.killModal('.walkme-action-destroy-1');
    console.log('Modal killed');

    // CASE INFORMATION SECTION
    console.log('Start case info');

    // Required field
    // Case Information Input: Location
    await this.page.waitFor(1000);
    const legalCounty = this.getLegalCountyName(caseData.property.county);
    await this.selectFromDropdown('Case', 'Location_Id', legalCounty, false);
    console.log('Case location entered (property county)');

    // Required field
    // Select Case Information Input: Category
    await this.page.waitFor(1000);
    await this.selectFromDropdown('Case', 'Category_Id', 'Civil', false);
    console.log('Case category entered');

    // Required field
    // Select Case Information Input: CaseType
    await this.page.waitFor(1000);
    await this.selectFromDropdown(
      'Case',
      'CaseType_Id',
      'Landlord/Tenant - Residential',
      false,
    );
    console.log('Case type entered');

    // Save Case Information
    await this.page.click('#btn16');
    console.log('Case info saved');

    // PARTY INFORMATION SECTION (Plaintiff Information)
    console.log('Starting Plaintiff section');

    // Checkbox: party isBusines
    await this.page.waitFor(3000);
    const isBusinessCheckbox = await this.page.waitForSelector(
      `input[id="Host.Areas.FileAndServeModule.Views.Envelope.ViewModels.PartyViewModel.IsBusiness"]`,
    );
    await isBusinessCheckbox.click();
    console.log('isBusiness Clicked');
    await this.page.waitFor(3000);

    // Required field
    await this.enterText('Party', 'BusinessName', caseData.client.name);
    console.log('Client name entered');

    if (caseData.client.address1 !== null && caseData.client.address1 !== '') {
      await this.enterText('Party', 'AddressLine1', caseData.client.address1);
      console.log('Client address entered');
    }

    if (caseData.client.address2 !== null && caseData.client.address2 !== '') {
      await this.enterText('Party', 'AddressLine2', caseData.client.address2);
      console.log('Client address2 entered');
    }

    if (caseData.client.city !== null && caseData.client.city !== '') {
      await this.enterText('Party', 'City', caseData.client.city);
      console.log('Client city entered');
    }

    if (caseData.client.state !== null && caseData.client.state !== '') {
      const clientState = this.getFullStateName(caseData.client.state);
      await this.selectFromDropdown('Party', 'State_Id', clientState, true);
      console.log('Client state entered');
    }

    if (caseData.client.zip !== null && caseData.client.zip !== '') {
      await this.enterText('Party', 'ZipCode', caseData.client.zip);
      console.log('Client zip entered');
    }

    if (
      caseData.case.attorney.name !== null &&
      caseData.case.attorney.name !== ''
    ) {
      await this.selectFromDropdown(
        'Party',
        'Attorney_Id',
        caseData.case.attorney.name,
        false,
      );
      console.log('Attorney selected');
    }

    // Save Plaintiff Party Information
    await this.savePartyInfo();
    console.log('Plaintiff info saved');

    // PARTY INFORMATION SECTION (Defendant Information)
    await this.page.waitFor(5000);
    console.log('Start defendant info');

    // Required field
    await this.enterText('Party', 'FirstName', caseData.tenant.firstName);
    console.log('Defendant firstName entered');

    if (
      caseData.tenant.middleName !== null &&
      caseData.tenant.middleName !== ''
    ) {
      await this.enterText('Party', 'MiddleName', caseData.tenant.middleName);
      console.log('Defendant middleName entered');
    }
    // Required field
    await this.page.waitFor(2000);
    await this.enterText('Party', 'LastName', caseData.tenant.lastName);
    console.log('Defendant lastName entered');

    if (caseData.tenant.suffix !== null && caseData.tenant.suffix !== '') {
      console.log('Defendant suffix entered');
      await this.selectFromDropdown(
        'Party',
        'Suffix',
        caseData.tenant.suffix,
        false,
      );
    }

    if (caseData.tenant.address1 !== null && caseData.tenant.address1 !== '') {
      await this.enterText('Party', 'AddressLine1', caseData.tenant.address1);
      console.log('Defendant address entered');
    }

    if (caseData.tenant.address2 !== null && caseData.tenant.address2 !== '') {
      await this.enterText('Party', 'AddressLine2', caseData.tenant.address2);
      console.log('Defendant address2 entered');
    }

    if (caseData.tenant.city !== null && caseData.tenant.city !== '') {
      await this.enterText('Party', 'City', caseData.tenant.city);
      console.log('Defendant city entered');
    }

    if (caseData.tenant.state !== null && caseData.tenant.state !== '') {
      const tenantState: string = this.getFullStateName(caseData.tenant.state);
      await this.page.waitFor(2000);
      await this.selectFromDropdown('Party', 'State_Id', tenantState, true);
      console.log('Defendant state entered');
    }

    if (caseData.tenant.zip !== null && caseData.tenant.zip !== '') {
      await this.enterText('Party', 'ZipCode', caseData.tenant.zip);
      console.log('Defendant zip entered');
    }

    if (caseData.tenant.phone !== null && caseData.tenant.phone !== '') {
      await this.enterText('Party', 'PhoneNumber', caseData.tenant.phone);
      console.log('Defendant phone entered');
    }

    // Save Defendant Party Information
    await this.savePartyInfo();
    console.log('Defendant info saved');

    await this.page.waitFor(5000);
    console.log('Parse header');
    const draftHeader: any = await this.page.$(
      'h2[class="tyler-display-inline-block header-ellipsis"]',
    );
    const draftHeaderText: any = await draftHeader.getProperty('innerText');
    const headerText: any = await draftHeaderText.jsonValue();
    const draftId: string = headerText.split(' ')[2];
    return draftId;
  }

  async goToURL(URL: string) {
    try {
      await this.page.goto(URL, { waitUntil: 'networkidle2' });
    } catch (error) {
      console.log(error);
    }
  }

  async logIn(USERNAME: string, PASSWORD: string) {
    await this.page.type('#UserName', USERNAME);
    await this.page.type('#Password', PASSWORD);
    await this.page.click('.btn');
  }

  async startCase() {
    const startCaseButton = await this.page.waitForSelector(
      `a[title="Start a New Case"]`,
      { visible: true },
    );
    await startCaseButton.click();
  }

  async killModal(cssSelector: string) {
    const closeModal = await this.page.waitForSelector(cssSelector);
    await closeModal.click();
  }

  async selectFromDropdown(
    sectionName: string,
    dataName: string,
    listItem: string,
    isState: boolean,
  ) {
    const sharedSelectorSegment = `Host.Areas.FileAndServeModule.Views.Envelope.ViewModels.${sectionName}ViewModel.${dataName}`;
    const listBoxSelector = `${sharedSelectorSegment}_listbox`;
    const ariaOwnsSelector = `aria-owns="${listBoxSelector}"`;
    const optionsSelector: string = `span[${ariaOwnsSelector}]`;
    const inputSelector: string = `input[${ariaOwnsSelector}]`;

    const options = await this.page.waitForSelector(optionsSelector);
    await options.click();

    const itemInput = await this.page.waitForSelector(inputSelector);
    isState
      ? await itemInput.type(listItem, { delay: 500 })
      : await itemInput.type(listItem);
    await this.page.waitFor(2000);

    await this.page.keyboard.press('ArrowDown', { delay: 100 });
    await this.page.keyboard.press('Tab', { delay: 100 });
  }

  async enterText(sectionName: string, dataName: string, text: string) {
    const textInputElement = await this.page.waitForSelector(
      `input[id="Host.Areas.FileAndServeModule.Views.Envelope.ViewModels.${sectionName}ViewModel.${dataName}"]`,
    );
    await textInputElement.type(text);
  }

  async savePartyInfo() {
    await this.page.waitFor(2000);
    await this.page.click('#btn37');
  }

  getFullStateName(stateAbbr: string) {
    if (stateAbbr === 'WA' || stateAbbr === 'wa') {
      return 'Washington';
    }
    return 'Oregon';
  }

  getLegalCountyName(county: string) {
    if (county === 'Multnomah' || county === 'multnomah') {
      return 'Multnomah Landlord Tenant';
    }
    return county;
  }
} // Bot Class
