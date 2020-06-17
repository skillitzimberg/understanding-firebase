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
    await this.page.waitFor(2000);
    await this.startCase('"/OfsWeb/FileAndServeModule/Envelope/AddOrEdit"');
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
    await this.selectFromDropdown('Case', 'Location_Id', legalCounty);
    console.log('Case location entered (property county)');

    // Required field
    // Select Case Information Input: Category
    await this.page.waitFor(1000);
    await this.selectFromDropdown('Case', 'Category_Id', 'Civil');
    console.log('Case category entered');

    // Required field
    // Select Case Information Input: CaseType
    await this.page.waitFor(1000);
    await this.selectFromDropdown(
      'Case',
      'CaseType_Id',
      'Landlord/Tenant - Residential',
    );
    console.log('Case type entered');

    // Save Case Information
    await this.page.click('#btn16');
    console.log('Case info saved');

    // PARTY INFORMATION SECTION (Plaintiff Information)
    console.log('Starting Plaintiff section');

    // Checkbox: party isBusines

    await this.page.waitForSelector(
      `input[id="Host.Areas.FileAndServeModule.Views.Envelope.ViewModels.PartyViewModel.IsBusiness"]`,
    );
    console.log('isBusiness Clicked');

    await this.page.click(
      'input[id="Host.Areas.FileAndServeModule.Views.Envelope.ViewModels.PartyViewModel.IsBusiness"]',
    );

    await this.page.waitFor(1000);
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
      await this.selectFromDropdown('Party', 'State_Id', clientState);
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
      );
      console.log('Attorney selected');
    }

    // Save Plaintiff Party Information
    await this.page.waitFor(2000);
    await this.page.click('#btn24');
    console.log('Plaintiff info saved');

    // PARTY INFORMATION SECTION (Defendant Information)
    await this.page.waitFor(3000);
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
      await this.selectFromDropdown('Party', 'Suffix', caseData.tenant.suffix);
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
      await this.selectFromDropdownV2('Party', 'State_Id', tenantState);
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
    // await this.page.waitFor(2000);
    await this.page.click('#btn24');
    console.log('Defendant info saved');

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
      await this.page.goto(URL);
    } catch (error) {
      console.log(error);
    }
  }

  async logIn(USERNAME: string, PASSWORD: string) {
    Promise.all([
      await this.page.type('#UserName', USERNAME),
      await this.page.type('#Password', PASSWORD),
      await this.page.click('.btn'),
    ]);
  }

  // StartCase starts a New Case
  async startCase(newCaseURL: string) {
    await Promise.all([
      this.page.waitForNavigation(),
      this.page.waitForSelector(`a[href=${newCaseURL}]`).then(async () => {
        await this.page.click(`a[href=${newCaseURL}]`);
      }),
    ]);
  }

  async killModal(cssSelector: string) {
    await this.page.waitForSelector(cssSelector);
    await this.page.click(`${cssSelector}`);
  }

  async selectFromDropdown(
    sectionName: string,
    dataName: string,
    listItem: string,
  ) {
    const sharedPathSegment = `Host.Areas.FileAndServeModule.Views.Envelope.ViewModels.${sectionName}ViewModel.${dataName}`;
    const ariaOwnsPath = `aria-owns="${sharedPathSegment}_listbox"`;
    const menuPath: string = `span[${ariaOwnsPath}]`;
    const inputPath: string = `input[${ariaOwnsPath}]`;
    const listOptionPath: string = `li[id="${sharedPathSegment}_option_selected"]`;

    await this.page.waitForSelector(menuPath);
    await this.page.click(`${menuPath}`);

    await this.page.waitForSelector(inputPath);
    await this.page.type(inputPath, listItem);

    await this.page.keyboard.press('ArrowDown', { delay: 100 });

    await this.page.waitForSelector(listOptionPath);
    let listItemText = await this.page.$eval(
      listOptionPath,
      li => li.innerHTML,
    );

    while (
      listItemText !== listItem &&
      listItemText !== listItem.toUpperCase()
    ) {
      await this.page.keyboard.press('ArrowDown');
      listItemText = await this.page.$eval(listOptionPath, li => li.innerHTML);
    }

    await this.page.click(listOptionPath);
  }

  // This is used on the Defendant Party information state field which behaves differently than others of the same type.
  async selectFromDropdownV2(
    sectionName: string,
    dataName: string,
    listItem: string,
  ) {
    const menuPath: string = `span[aria-owns="Host.Areas.FileAndServeModule.Views.Envelope.ViewModels.${sectionName}ViewModel.${dataName}_listbox"]`;

    const listPath: string = `ul[id="Host.Areas.FileAndServeModule.Views.Envelope.ViewModels.${sectionName}ViewModel.${dataName}_listbox"]`;

    const listItemPath: string = `li[id="Host.Areas.FileAndServeModule.Views.Envelope.ViewModels.${sectionName}ViewModel.${dataName}_option_selected"]`;

    await this.page.waitFor(2000);
    await this.page.waitForSelector(menuPath);
    await this.page.click(`${menuPath}`);

    await this.page.keyboard.press('ArrowDown');

    await this.page.waitForSelector(listItemPath);
    let listItemText = await this.page.$eval(listItemPath, li => li.innerHTML);
    console.log(listItemText, listItem);
    if (listItemText === 'Alabama') {
      while (listItemText !== listItem) {
        await this.page.keyboard.press('ArrowDown');
        listItemText = await this.page.$eval(listItemPath, li => li.innerHTML);
      }
      // Go one selection past target item. This is kind of a bug work around. The field will not acknowledge a valid entry if the item is both selected and clicked.
      await this.page.keyboard.press('ArrowDown');
    }

    // Get the item to select.
    const itemToSelect: any = await this.listSelectUtil(
      `${listPath} li:nth-child(1n + 1)`,
      listItem,
    );
    await itemToSelect.click();
  }

  listSelectUtil = async (listPath: string, listItem: string) => {
    await this.page.waitForSelector(listPath);
    const handles = await this.page.$$(listPath);

    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];

      const handleText = await (
        await handle.getProperty('innerText')
      ).jsonValue();

      if (handleText !== listItem && handleText !== listItem.toUpperCase()) {
        continue;
      } else {
        return handles[i];
      }
    }
    return null;
  };

  async enterText(sectionName: string, dataName: string, text: string) {
    await this.page.waitForSelector(
      `input[id="Host.Areas.FileAndServeModule.Views.Envelope.ViewModels.${sectionName}ViewModel.${dataName}"]`,
    );

    await this.page.type(
      `input[id="Host.Areas.FileAndServeModule.Views.Envelope.ViewModels.${sectionName}ViewModel.${dataName}"]`,
      text,
    );
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
