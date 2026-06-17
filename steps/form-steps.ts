import { When } from '@cucumber/cucumber';
import { LocatorProWrapper } from '../utils/locatorpro-wrapper';
import { ReportLogger } from '../utils/report-logger';
import { resolveCsvPlaceholders } from '../utils/csv-reader';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

// ==================== FORM INTERACTION STEPS ====================

When('I enter {string} in {string}', async function (value: string, elementName: string) {
  value = resolveCsvPlaceholders(value, this.testDataRow);
  elementName = resolveCsvPlaceholders(elementName, this.testDataRow);
  ReportLogger.logInfo(`🔍 Looking for input field: "${elementName}"`);
  
  let filled = false;
  let actualValue = value;

  if (actualValue === '') {
        // elementName will be like "SF_Username" or "CE_Password"
        const [prefix, fieldType] = elementName.split('_'); // e.g. "SF_Username" → ["SF", "Username"]

        if (prefix && fieldType) {
            const envVarName = `${prefix}_${fieldType}`;
            actualValue = process.env[envVarName] || '';

            if (actualValue) {
                ReportLogger.logInfo(`✅ Using ${envVarName} from env for field: ${elementName}`);
            } else {
                ReportLogger.logInfo(`⚠️ No env variable found for ${envVarName}`);
            }
        }
    }

  
  // Handle env var field names (e.g. "CE_UserName" → "UserName")
  if (elementName.includes('_')) {
    const parts = elementName.split('_');
    elementName = parts[1];
  }

  // Strategy -2: If the field isn't on the current page, look at every page in the
  // browser context (Salesforce can open record edit forms in a popup window).
  // Switch `this.page` to whichever page contains a visible matching textbox.
  try {
    if (this.context && typeof this.context.pages === 'function') {
      const pages = this.context.pages();
      for (const p of pages) {
        if (p === this.page || p.isClosed()) continue;
        try {
          let tb = p.getByRole('textbox', { name: elementName, exact: true }).first();
          try {
            await tb.waitFor({ state: 'visible', timeout: 3000 });
          } catch {
            tb = p.getByRole('textbox', { name: elementName, exact: false }).first();
            await tb.waitFor({ state: 'visible', timeout: 1000 });
          }
          ReportLogger.logInfo(`🪟 Found "${elementName}" in popup page: ${p.url()} — switching context`);
          this.page = p;
          await tb.scrollIntoViewIfNeeded().catch(() => {});
          await tb.fill(actualValue);
          ReportLogger.logInfo(`✅ Filled "${elementName}" via popup-page role=textbox with: ${actualValue}`);
          filled = true;
          break;
        } catch {
          // Try next page
        }
      }
    }
  } catch {
    // ignore
  }

  // Strategy -1: If a Salesforce modal dialog is open, scope all lookups to it first.
  // SF "New Account" opens inside a [role="dialog"] over the existing record view,
  // so a global query can hit a duplicate field on the page behind it.
  const dialogScope = this.page.locator('section[role="dialog"], div[role="dialog"]').last();
  try {
    if (await dialogScope.count() > 0 && await dialogScope.isVisible().catch(() => false)) {
      // Prefer exact accessible-name match so e.g. "Email" doesn't also hit "Email Correspondence Name"
      let dialogTextbox = dialogScope.getByRole('textbox', { name: elementName, exact: true });
      try {
        await dialogTextbox.first().waitFor({ state: 'visible', timeout: 15000 });
      } catch {
        // Fall back to fuzzy match if no exact label exists
        dialogTextbox = dialogScope.getByRole('textbox', { name: elementName, exact: false });
      }

      const dCount = await dialogTextbox.count();
      for (let i = 0; i < dCount; i++) {
        const tb = dialogTextbox.nth(i);
        if (await tb.isVisible().catch(() => false)) {
          await tb.scrollIntoViewIfNeeded().catch(() => {});
          await tb.fill(actualValue);
          ReportLogger.logInfo(`✅ Filled "${elementName}" via dialog role=textbox with: ${actualValue}`);
          filled = true;
          break;
        }
      }

      // Dialog label[for] resolution (handles label with <abbr aria-hidden="true">*</abbr>).
      // Two-pass: exact label match first, fuzzy `includes` only as fallback, so
      // "Email" never wrongly resolves to "Email Correspondence Name".
      if (!filled) {
        const inputId = await dialogScope.evaluate((root: Element, wanted: string) => {
          const labels = Array.from(root.querySelectorAll('label[for]')) as HTMLLabelElement[];
          const resolve = (lbl: HTMLLabelElement): string | null => {
            const id = lbl.getAttribute('for');
            if (!id) return null;
            const ctrl = document.getElementById(id) as HTMLElement | null;
            if (!ctrl) return null;
            const rect = ctrl.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return null;
            return id;
          };
          const norm = (l: HTMLLabelElement) => {
            const clone = l.cloneNode(true) as HTMLElement;
            clone.querySelectorAll('[aria-hidden="true"]').forEach(n => n.remove());
            return (clone.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
          };
          for (const lbl of labels) {
            if (norm(lbl) === wanted) {
              const id = resolve(lbl);
              if (id) return id;
            }
          }
          for (const lbl of labels) {
            if (norm(lbl).includes(wanted)) {
              const id = resolve(lbl);
              if (id) return id;
            }
          }
          return null;
        }, elementName.trim().toLowerCase()).catch(() => null);

        if (inputId) {
          const ctrl = dialogScope.locator(`#${inputId.replace(/([^\w-])/g, '\\$1')}`);
          await ctrl.scrollIntoViewIfNeeded().catch(() => {});
          await ctrl.fill(actualValue);
          ReportLogger.logInfo(`✅ Filled "${elementName}" via dialog label[for]=#${inputId} with: ${actualValue}`);
          filled = true;
        }
      }
    }
  } catch {
    // Fall through to global strategies
  }

  // Strategy 0: Role-based textbox (fastest, no unnecessary scrolling).
  // Wait up to 10s for the field to become visible — handles SF modals where the
  // form content streams in after a "New" click. Prefer exact accessible-name match.
  if (!filled) {
   try {
    let roleTextbox = this.page.getByRole('textbox', { name: elementName, exact: true });
    try {
      await roleTextbox.first().waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      roleTextbox = this.page.getByRole('textbox', { name: elementName, exact: false });
    }
    const roleCount = await roleTextbox.count();
    if (roleCount > 0) {
      for (let ri = 0; ri < roleCount; ri++) {
        const tb = roleTextbox.nth(ri);
        const isVisible = await tb.isVisible().catch(() => false);
        if (isVisible) {
          await tb.scrollIntoViewIfNeeded().catch(() => {});
          await tb.fill(actualValue);
          ReportLogger.logInfo(`✅ Filled "${elementName}" via role-based textbox with: ${actualValue}`);
          filled = true;
          break;
        }
      }
    }
   } catch (error) {
    // Continue to fallback strategies
   }
  }

  // Strategy 1: Use Playwright's getByLabel — prefer exact match first
  if (!filled) {
    try {
      let input = this.page.getByLabel(elementName, { exact: true });
      let count = await input.count();
      if (count === 0) {
        input = this.page.getByLabel(elementName, { exact: false });
        count = await input.count();
      }

      if (count > 0) {
        ReportLogger.logInfo(`🎯 Found ${count} inputs with label "${elementName}"`);

        for (let i = 0; i < count; i++) {
          const element = input.nth(i);
          const tagName = await element.evaluate((el: any) => el.tagName.toLowerCase());

          if (tagName === 'input' || tagName === 'textarea') {
            const isVisible = await element.isVisible().catch(() => false);
            if (isVisible) {
              await element.scrollIntoViewIfNeeded().catch(() => {});
              await element.fill(actualValue);
              ReportLogger.logInfo(`✅ Filled "${elementName}" (getByLabel) with: ${actualValue}`);
              filled = true;
              break;
            }
          } else {
            // For LWC/web components, Playwright pierces shadow DOM in locator chains
            try {
              const innerInput = element.locator('input:not([type="hidden"]), textarea').first();
              const isVisible = await innerInput.isVisible().catch(() => false);
              if (isVisible) {
                await innerInput.scrollIntoViewIfNeeded().catch(() => {});
                await innerInput.fill(actualValue);
                ReportLogger.logInfo(`✅ Filled "${elementName}" (getByLabel > shadow input) with: ${actualValue}`);
                filled = true;
                break;
              }
            } catch {
              // Continue to next element
            }
          }
        }
      }
    } catch (error) {
      // Continue to fallback strategies
    }
  }

  // Strategy 1.5: Salesforce LWC — scan lightning-input/textarea components by their label text.
  // Prefer exact label match; only fall back to fuzzy if no exact match is found.
  if (!filled) {
    try {
      const lwcComponents = this.page.locator('lightning-input, lightning-textarea');
      const lwcCount = await lwcComponents.count();
      const tryMatch = async (matcher: (compIdx: number) => Promise<boolean>) => {
        for (let i = 0; i < lwcCount; i++) {
          if (await matcher(i)) return true;
        }
        return false;
      };
      const fillIfLabelMatches = async (i: number, exact: boolean) => {
        const comp = lwcComponents.nth(i);
        const labelEl = exact
          ? comp.locator('label').filter({ hasText: new RegExp(`^\\s*\\*?\\s*${elementName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') })
          : comp.locator('label').filter({ hasText: new RegExp(elementName, 'i') });
        if (await labelEl.count() === 0) return false;
        const innerInput = comp.locator('input:not([type="hidden"]), textarea').first();
        if (!(await innerInput.isVisible().catch(() => false))) return false;
        await innerInput.scrollIntoViewIfNeeded().catch(() => {});
        await innerInput.fill(actualValue);
        ReportLogger.logInfo(`✅ Filled "${elementName}" (LWC ${exact ? 'exact' : 'fuzzy'}) with: ${actualValue}`);
        filled = true;
        return true;
      };
      await tryMatch(i => fillIfLabelMatches(i, true));
      if (!filled) await tryMatch(i => fillIfLabelMatches(i, false));
    } catch (error) {
      // Continue to fallback strategies
    }
  }

  // Strategy 1.6: Salesforce label[for] resolution — handles labels containing <abbr>*</abbr>.
  // Two-pass: exact label match wins; substring `includes` is a fallback so that
  // "Email" never wrongly resolves to "Email Correspondence Name".
  if (!filled) {
    try {
      const target = elementName.trim().toLowerCase();
      const inputId = await this.page.evaluate((wanted: string) => {
        const labels = Array.from(document.querySelectorAll('label[for]')) as HTMLLabelElement[];
        const norm = (l: HTMLLabelElement) => {
          const clone = l.cloneNode(true) as HTMLElement;
          clone.querySelectorAll('[aria-hidden="true"]').forEach(n => n.remove());
          return (clone.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        };
        const resolve = (lbl: HTMLLabelElement): string | null => {
          const id = lbl.getAttribute('for');
          if (!id) return null;
          const ctrl = document.getElementById(id) as HTMLElement | null;
          if (!ctrl) return null;
          const rect = ctrl.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return null;
          return id;
        };
        for (const lbl of labels) {
          if (norm(lbl) === wanted) {
            const id = resolve(lbl);
            if (id) return id;
          }
        }
        for (const lbl of labels) {
          if (norm(lbl).includes(wanted)) {
            const id = resolve(lbl);
            if (id) return id;
          }
        }
        return null;
      }, target);

      if (inputId) {
        const ctrl = this.page.locator(`#${CSS.escape(inputId)}`);
        await ctrl.scrollIntoViewIfNeeded().catch(() => {});
        await ctrl.fill(actualValue);
        ReportLogger.logInfo(`✅ Filled "${elementName}" (label[for]=#${inputId}) with: ${actualValue}`);
        filled = true;
      }
    } catch (error) {
      // Continue to fallback strategies
    }
  }
  
  // Strategy 2: Try multiple selector-based strategies
  if (!filled) {
    const fieldName = elementName.toLowerCase();
    const strategies = [
      `input[name="${fieldName}"]`,
      `input[id="${fieldName}"]`,
      `input[placeholder*="${elementName}" i]`,
      `input[aria-label*="${elementName}" i]`,
      `input[type="text"][name*="${fieldName}"]`,
      `input[type="email"][name*="${fieldName}"]`,
      `input[type="password"][name*="${fieldName}"]`,
      `label:has-text("${elementName}") input`,
      `label:has-text("${elementName}") + input`,
      `label:has-text("${elementName}") ~ input`,
      `label:has-text("${elementName}") + div input`,
      `label:has-text("${elementName}") ~ div input`,
      `label:has-text("${elementName}") + * input`,
      `label:has-text("${elementName}") ~ * input`,
      `text="${elementName}" >> .. >> input`,
      `textarea[name="${fieldName}"]`,
      `textarea[placeholder*="${elementName}" i]`,
    ];
    
    for (const selector of strategies) {
      try {
        const locator = this.page.locator(selector).first();
        const count = await locator.count();
        if (count > 0) {
          const isVisible = await locator.isVisible().catch(() => false);
          if (isVisible) {
            ReportLogger.logInfo(`🎯 Found field "${elementName}" using: ${selector}`);
            await locator.fill(actualValue);
            ReportLogger.logInfo(`✅ Filled "${elementName}" with: ${actualValue}`);
            filled = true;
            break;
          }
        }
      } catch (error) {
        continue;
      }
    }
  }

  // Strategy 3: Iframe-aware lookup (Salesforce Console apps render record forms inside iframes)
  if (!filled) {
    try {
      const frames = this.page.frames();
      for (const frame of frames) {
        if (frame === this.page.mainFrame()) continue;
        try {
          // a) accessible-name textbox inside the frame — exact match preferred
          let tb = frame.getByRole('textbox', { name: elementName, exact: true });
          if (await tb.count() === 0) {
            tb = frame.getByRole('textbox', { name: elementName, exact: false });
          }
          if (await tb.count() > 0) {
            const first = tb.first();
            if (await first.isVisible().catch(() => false)) {
              await first.scrollIntoViewIfNeeded().catch(() => {});
              await first.fill(actualValue);
              ReportLogger.logInfo(`✅ Filled "${elementName}" (iframe role=textbox) with: ${actualValue}`);
              filled = true;
              break;
            }
          }

          // b) getByLabel in the frame — exact match preferred
          let lbl = frame.getByLabel(elementName, { exact: true });
          if (await lbl.count() === 0) {
            lbl = frame.getByLabel(elementName, { exact: false });
          }
          if (await lbl.count() > 0) {
            const cnt = await lbl.count();
            for (let i = 0; i < cnt; i++) {
              const el = lbl.nth(i);
              const tag = await el.evaluate((n: any) => n.tagName.toLowerCase()).catch(() => '');
              if (tag === 'input' || tag === 'textarea') {
                if (await el.isVisible().catch(() => false)) {
                  await el.scrollIntoViewIfNeeded().catch(() => {});
                  await el.fill(actualValue);
                  ReportLogger.logInfo(`✅ Filled "${elementName}" (iframe getByLabel) with: ${actualValue}`);
                  filled = true;
                  break;
                }
              } else {
                const inner = el.locator('input:not([type="hidden"]), textarea').first();
                if (await inner.isVisible().catch(() => false)) {
                  await inner.scrollIntoViewIfNeeded().catch(() => {});
                  await inner.fill(actualValue);
                  ReportLogger.logInfo(`✅ Filled "${elementName}" (iframe label > input) with: ${actualValue}`);
                  filled = true;
                  break;
                }
              }
            }
            if (filled) break;
          }

          // c) lightning-input components inside the frame — exact label match preferred
          const lwc = frame.locator('lightning-input, lightning-textarea');
          const lwcN = await lwc.count();
          const escapedName = elementName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const exactRe = new RegExp(`^\\s*\\*?\\s*${escapedName}\\s*$`, 'i');
          const fuzzyRe = new RegExp(elementName, 'i');
          const fillByLwcLabel = async (re: RegExp) => {
            for (let i = 0; i < lwcN; i++) {
              const comp = lwc.nth(i);
              const labelEl = comp.locator('label').filter({ hasText: re });
              if (await labelEl.count() > 0) {
                const inner = comp.locator('input:not([type="hidden"]), textarea').first();
                if (await inner.isVisible().catch(() => false)) {
                  await inner.scrollIntoViewIfNeeded().catch(() => {});
                  await inner.fill(actualValue);
                  ReportLogger.logInfo(`✅ Filled "${elementName}" (iframe LWC) with: ${actualValue}`);
                  filled = true;
                  return true;
                }
              }
            }
            return false;
          };
          if (!filled) await fillByLwcLabel(exactRe);
          if (!filled) await fillByLwcLabel(fuzzyRe);
          if (filled) break;

          // d) label[for] resolution inside the frame (light DOM only) — exact wins, includes as fallback
          const target = elementName.trim().toLowerCase();
          const inputId = await frame.evaluate((wanted: string) => {
            const labels = Array.from(document.querySelectorAll('label[for]')) as HTMLLabelElement[];
            const norm = (l: HTMLLabelElement) => {
              const clone = l.cloneNode(true) as HTMLElement;
              clone.querySelectorAll('[aria-hidden="true"]').forEach(n => n.remove());
              return (clone.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
            };
            const resolve = (lbl: HTMLLabelElement): string | null => {
              const id = lbl.getAttribute('for');
              if (!id) return null;
              const ctrl = document.getElementById(id) as HTMLElement | null;
              if (!ctrl) return null;
              const rect = ctrl.getBoundingClientRect();
              if (rect.width === 0 && rect.height === 0) return null;
              return id;
            };
            for (const lbl of labels) {
              if (norm(lbl) === wanted) {
                const id = resolve(lbl);
                if (id) return id;
              }
            }
            for (const lbl of labels) {
              if (norm(lbl).includes(wanted)) {
                const id = resolve(lbl);
                if (id) return id;
              }
            }
            return null;
          }, target).catch(() => null);

          if (inputId) {
            const ctrl = frame.locator(`#${inputId.replace(/([^\w-])/g, '\\$1')}`);
            await ctrl.scrollIntoViewIfNeeded().catch(() => {});
            await ctrl.fill(actualValue);
            ReportLogger.logInfo(`✅ Filled "${elementName}" (iframe label[for]=#${inputId}) with: ${actualValue}`);
            filled = true;
            break;
          }
        } catch {
          // Try next frame
        }
      }
    } catch (error) {
      // Continue to error
    }
  }

  if (!filled) {
    throw new Error(`Could not find input field: ${elementName}`);
  }
});



When('I enter {string} in the {string} field', async function (value: string, fieldName: string) {
  // Use LocatorPro's smart fill with auto-enhancement
  await LocatorProWrapper.smartFill(this.page, `input[name="${fieldName}"]`, value, fieldName);
});

When('I select {string} from {string}', async function (value: string, elementName: string) {
  value = resolveCsvPlaceholders(value, this.testDataRow);
  elementName = resolveCsvPlaceholders(elementName, this.testDataRow);
  ReportLogger.logInfo(`🔍 Looking for dropdown: "${elementName}"`);
  
  let selected = false;
  let lastError: Error | null = null;

  // Strategy 0: Salesforce Aura picklist (forceInputPicklist / uiInputSelect).
  // The label is a plain <span> (not a <label for>), and the trigger is an
  // <a role="button" aria-haspopup="true">. After clicking it, options render
  // as <a role="menuitemradio"> (or <li>) under .uiMenuList.
  try {
    const picklistContainer = this.page.locator(
      `.uiInputSelect:has(span.uiPicklistLabel:has-text("${elementName}")), ` +
      `.forceInputPicklist:has(span.uiPicklistLabel:has-text("${elementName}"))`
    ).first();

    if (await picklistContainer.count() > 0) {
      const trigger = picklistContainer.locator('a[role="button"][aria-haspopup="true"]').first();
      if (await trigger.count() > 0) {
        ReportLogger.logInfo(`🎯 Found Aura picklist trigger for "${elementName}"`);
        await trigger.scrollIntoViewIfNeeded().catch(() => {});
        await trigger.click({ timeout: 10000 });
        await this.page.waitForTimeout(500);

        // The opened menu is rendered in a panel that may not be a descendant
        // of the trigger. Match the option globally by visible text.
        const optionCandidates = [
          this.page.locator(`.uiMenuList a:has-text("${value}")`),
          this.page.locator(`.uiMenuList li:has-text("${value}")`),
          this.page.locator(`a[role="menuitemradio"]:has-text("${value}")`),
          this.page.getByRole('menuitem', { name: value, exact: false }),
          this.page.getByRole('option', { name: value, exact: false }),
        ];

        for (const opt of optionCandidates) {
          const c = await opt.count().catch(() => 0);
          if (c === 0) continue;
          const visible = opt.first();
          try {
            await visible.scrollIntoViewIfNeeded().catch(() => {});
            await visible.click({ timeout: 5000 });
            ReportLogger.logInfo(`✅ Selected "${value}" from "${elementName}" (Aura picklist)`);
            selected = true;
            break;
          } catch {
            continue;
          }
        }
      }
    }
  } catch (error) {
    lastError = error as Error;
  }

  // Strategy 1: Try Playwright's getByLabel (most reliable for accessible forms)
  if (!selected) try {
    const labelLocator = this.page.getByLabel(elementName, { exact: false });
    const count = await labelLocator.count();
    if (count > 0) {
      ReportLogger.logInfo(`🎯 Found by label (getByLabel) - ${count} matches`);
      
      // Try each match to find the actual form control
      for (let i = 0; i < count; i++) {
        try {
          const element = labelLocator.nth(i);
          ReportLogger.logInfo(`  Checking element ${i + 1} of ${count}`);
          
          // Add timeout to evaluate to prevent hanging
          const tagName = await element.evaluate((el: any) => el.tagName.toLowerCase(), { timeout: 5000 }).catch(() => null);
          
          if (!tagName) {
            ReportLogger.logInfo(`  Element ${i + 1} - Could not get tag name, skipping`);
            continue;
          }
          
          ReportLogger.logInfo(`  Element ${i + 1} - Tag: ${tagName}`);
          
          if (tagName === 'select') {
            await element.selectOption(value, { timeout: 10000 });
            ReportLogger.logInfo(`✅ Selected "${value}" from ${elementName} (native select)`);
            selected = true;
            break;
          } else if (tagName === 'input' || tagName === 'button' || tagName === 'div') {
            const role = await element.getAttribute('role');
            ReportLogger.logInfo(`  Element ${i + 1} - Role: ${role}`);
            if (role === 'combobox' || role === 'listbox') {
              await element.click({ timeout: 10000 });
              await this.page.waitForTimeout(500);
              await this.page.getByRole('option', { name: value, exact: false }).first().click({ timeout: 10000 });
              ReportLogger.logInfo(`✅ Selected "${value}" from ${elementName} (custom select)`);
              selected = true;
              break;
            }
          }
        } catch (e: any) {
          ReportLogger.logInfo(`  Element ${i + 1} - Error: ${e.message}`);
          continue;
        }
      }
    }
  } catch (error) {
    lastError = error as Error;
  }
  
  // Strategy 2: Find by text and look for nearby combobox
  if (!selected) {
    try {
      const labelText = this.page.locator(`text="${elementName}"`).first();
      const labelCount = await labelText.count();
      if (labelCount > 0) {
        ReportLogger.logInfo(`🎯 Found label text, looking for nearby combobox`);
        
        // Try to find combobox in the same container
        const container = labelText.locator('xpath=ancestor::*[contains(@class, "field") or contains(@class, "form") or contains(@class, "input")][1]');
        const combobox = container.locator('[role="combobox"]').first();
        
        if (await combobox.count() > 0) {
          await combobox.click();
          await this.page.waitForTimeout(500);
          await this.page.getByRole('option', { name: value, exact: false }).first().click();
          ReportLogger.logInfo(`✅ Selected "${value}" from ${elementName} (found via container)`);
          selected = true;
        }
      }
    } catch (error) {
      lastError = error as Error;
    }
  }
  
  // Strategy 3: Direct role-based search with text filter
  if (!selected) {
    try {
      const comboboxes = this.page.getByRole('combobox');
      const count = await comboboxes.count();
      
      for (let i = 0; i < count; i++) {
        const combobox = comboboxes.nth(i);
        const ariaLabel = await combobox.getAttribute('aria-label');
        const id = await combobox.getAttribute('id');
        
        if (ariaLabel?.includes(elementName) || id?.toLowerCase().includes(elementName.toLowerCase())) {
          ReportLogger.logInfo(`🎯 Found combobox by aria-label or id`);
          await combobox.click();
          await this.page.waitForTimeout(500);
          await this.page.getByRole('option', { name: value, exact: false }).first().click();
          ReportLogger.logInfo(`✅ Selected "${value}" from ${elementName}`);
          selected = true;
          break;
        }
      }
    } catch (error) {
      lastError = error as Error;
    }
  }
  
  if (!selected) {
    const errorMsg = lastError ? `: ${lastError.message}` : '';
    throw new Error(`Could not find select element: ${elementName}${errorMsg}`);
  }
});

When('I check {string}', async function (elementName: string) {
  // Try multiple strategies to find the checkbox
  const fieldName = elementName.toLowerCase();
  let checked = false;

  // Strategy 0: Role-based checkbox (works for SF Lightning and standard HTML)
  // Uses force:true to bypass SLDS/LWC span overlays that intercept pointer events
  try {
    const roleCheckbox = this.page.getByRole('checkbox', { name: elementName });
    const roleCount = await roleCheckbox.count();
    if (roleCount > 0) {
      for (let ri = 0; ri < roleCount; ri++) {
        const cb = roleCheckbox.nth(ri);
        const isVisible = await cb.isVisible().catch(() => false);
        if (isVisible) {
          await cb.scrollIntoViewIfNeeded().catch(() => {});
          await cb.check({ force: true });
          ReportLogger.logInfo(`✅ Checked "${elementName}" via role-based strategy`);
          checked = true;
          break;
        }
      }
    }
  } catch (error) {
    ReportLogger.logInfo(`Role-based checkbox strategy failed for "${elementName}": ${error}`);
  }

  // Strategy 1-5: CSS selector strategies
  if (!checked) {
    const strategies = [
      `input[type="checkbox"][name="${fieldName}"]`,
      `input[type="checkbox"][id="${fieldName}"]`,
      `input[type="checkbox"][value*="${elementName}" i]`,
      `label:has-text("${elementName}") input[type="checkbox"]`,
      `input[type="checkbox"] + label:has-text("${elementName}")`,
    ];
    
    for (const selector of strategies) {
      try {
        const locator = this.page.locator(selector);
        const count = await locator.count();
        if (count > 0) {
          ReportLogger.logInfo(`🎯 Found checkbox "${elementName}" using strategy: ${selector}`);
          const enhancedLocator = await LocatorProWrapper.autoEnhance(this.page, locator);
          await enhancedLocator.check();
          ReportLogger.logInfo(`✅ Checked "${elementName}" (${selector})`);
          checked = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }
  }
  
  // Fallback: try to find by text and click the associated checkbox
  if (!checked) {
    try {
      ReportLogger.logInfo(`🔍 Using text-based search for checkbox: "${elementName}"`);
      const labelLocator = this.page.locator(`label:has-text("${elementName}")`);
      const checkboxLocator = labelLocator.locator('input[type="checkbox"]');
      const count = await checkboxLocator.count();
      if (count > 0) {
        await checkboxLocator.check();
        ReportLogger.logInfo(`✅ Checked "${elementName}" via label text`);
        checked = true;
      } else {
        // Try clicking the label itself which should check the checkbox
        await labelLocator.click();
        ReportLogger.logInfo(`✅ Clicked label for "${elementName}"`);
        checked = true;
      }
    } catch (error) {
      // Last resort: use getByRole with partial name match
      try {
        const partialName = elementName.substring(0, 20);
        const roleCheckbox = this.page.getByRole('checkbox', { name: new RegExp(partialName, 'i') });
        await roleCheckbox.first().scrollIntoViewIfNeeded().catch(() => {});
        await roleCheckbox.first().check();
        ReportLogger.logInfo(`✅ Checked "${elementName}" via partial role match`);
      } catch (roleError) {
        await LocatorProWrapper.clickByText(this.page, elementName);
        ReportLogger.logInfo(`✅ Used LocatorPro to check "${elementName}"`);
      }
    }
  }
});

When('I uncheck {string}', async function (elementName: string) {
  const fieldName = elementName.toLowerCase();
  let unchecked = false;

  // Strategy 0: Role-based checkbox with force:true to bypass SLDS/LWC span overlays
  try {
    const roleCheckbox = this.page.getByRole('checkbox', { name: elementName });
    const roleCount = await roleCheckbox.count();
    if (roleCount > 0) {
      for (let ri = 0; ri < roleCount; ri++) {
        const cb = roleCheckbox.nth(ri);
        const isVisible = await cb.isVisible().catch(() => false);
        if (isVisible) {
          await cb.scrollIntoViewIfNeeded().catch(() => {});
          await cb.uncheck({ force: true });
          ReportLogger.logInfo(`✅ Unchecked "${elementName}" via role-based strategy`);
          unchecked = true;
          break;
        }
      }
    }
  } catch (error) {
    ReportLogger.logInfo(`Role-based uncheck strategy failed for "${elementName}": ${error}`);
  }

  // Strategy 1: CSS selector strategies
  if (!unchecked) {
    const strategies = [
      `input[type="checkbox"][name="${fieldName}"]`,
      `input[type="checkbox"][id="${fieldName}"]`,
      `label:has-text("${elementName}") input[type="checkbox"]`,
      `input[type="checkbox"] + label:has-text("${elementName}")`,
    ];
    
    for (const selector of strategies) {
      try {
        const locator = this.page.locator(selector).first();
        const count = await locator.count();
        if (count > 0) {
          await locator.scrollIntoViewIfNeeded().catch(() => {});
          await locator.uncheck({ force: true });
          ReportLogger.logInfo(`✅ Unchecked "${elementName}" (${selector})`);
          unchecked = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }
  }

  if (!unchecked) {
    throw new Error(`Could not find checkbox to uncheck: "${elementName}"`);
  }
});

When('I select the {string} radio button', async function (elementName: string) {
  // Try multiple strategies to find the radio button
  const fieldName = elementName.toLowerCase();
  const strategies = [
    `input[type="radio"][value="${elementName}"]`,
    `input[type="radio"][value="${fieldName}"]`,
    `input[type="radio"][id="${fieldName}"]`,
    `input[type="radio"][name="${fieldName}"]`,
    `label:has-text("${elementName}") input[type="radio"]`,
    `input[type="radio"] + label:has-text("${elementName}")`,
  ];
  
  let selected = false;
  for (const selector of strategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        ReportLogger.logInfo(`🎯 Found radio button "${elementName}" using strategy: ${selector}`);
        const enhancedLocator = await LocatorProWrapper.autoEnhance(this.page, locator);
        await enhancedLocator.check();
        ReportLogger.logInfo(`✅ Selected radio button "${elementName}" (${selector})`);
        selected = true;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  // Fallback: try to find by text and click the associated radio button
  if (!selected) {
    try {
      ReportLogger.logInfo(`🔍 Using text-based search for radio button: "${elementName}"`);
      const labelLocator = this.page.locator(`label:has-text("${elementName}")`);
      const radioLocator = labelLocator.locator('input[type="radio"]');
      const count = await radioLocator.count();
      if (count > 0) {
        await radioLocator.check();
        ReportLogger.logInfo(`✅ Selected radio button "${elementName}" via label text`);
        selected = true;
      } else {
        // Try clicking the label itself which should select the radio button
        await labelLocator.click();
        ReportLogger.logInfo(`✅ Clicked label for radio button "${elementName}"`);
        selected = true;
      }
    } catch (error) {
      // Last resort: use LocatorPro to find and click
      await LocatorProWrapper.clickByText(this.page, elementName);
      ReportLogger.logInfo(`✅ Used LocatorPro to select radio button "${elementName}"`);
    }
  }
});

When('I enter {string} in the {string} textarea', async function (value: string, elementName: string) {
  ReportLogger.logInfo(`🔍 Looking for textarea: "${elementName}"`);
  
  let filled = false;
  
  // Strategy 1: Use Playwright's getByLabel (most reliable)
  try {
    const textarea = this.page.getByLabel(elementName, { exact: false });
    const count = await textarea.count();
    
    if (count > 0) {
      ReportLogger.logInfo(`🎯 Found ${count} textareas with label "${elementName}"`);
      
      for (let i = 0; i < count; i++) {
        const element = textarea.nth(i);
        const tagName = await element.evaluate((el: any) => el.tagName.toLowerCase());
        
        if (tagName === 'textarea') {
          await element.fill(value);
          ReportLogger.logInfo(`✅ Filled textarea "${elementName}" (getByLabel) with: ${value}`);
          filled = true;
          break;
        }
      }
    }
  } catch (error) {
    // Continue to fallback strategies
  }
  
  // Strategy 2: Try multiple selector-based strategies
  if (!filled) {
    const fieldName = elementName.toLowerCase();
    const strategies = [
      `textarea[name="${fieldName}"]`,
      `textarea[id="${fieldName}"]`,
      `textarea[placeholder*="${elementName}" i]`,
      `textarea[aria-label*="${elementName}" i]`,
      `label:has-text("${elementName}") textarea`,
      `label:has-text("${elementName}") + textarea`,
      `label:has-text("${elementName}") ~ textarea`,
      `text="${elementName}" >> .. >> textarea`,
    ];
    
    for (const selector of strategies) {
      try {
        const locator = this.page.locator(selector).first();
        const count = await locator.count();
        if (count > 0) {
          const isVisible = await locator.isVisible().catch(() => false);
          if (isVisible) {
            ReportLogger.logInfo(`🎯 Found textarea "${elementName}" using: ${selector}`);
            await locator.fill(value);
            ReportLogger.logInfo(`✅ Filled textarea "${elementName}" with: ${value}`);
            filled = true;
            break;
          }
        }
      } catch (error) {
        continue;
      }
    }
  }
  
  if (!filled) {
    throw new Error(`Could not find textarea: ${elementName}`);
  }
});

// ==================== FILE UPLOAD STEPS ====================

When('I upload {string} to {string}', async function (filePath: string, elementName: string) {
  ReportLogger.logInfo(`🔍 Looking for file upload field: "${elementName}"`);
  
  // Resolve file path - support relative paths from project root or testdata folder
  const path = require('path');
  let resolvedPath = filePath;
  
  // If path is not absolute, try to resolve it
  if (!path.isAbsolute(filePath)) {
    // Try testdata folder first
    const testdataPath = path.resolve(process.cwd(), 'testdata', filePath);
    const fs = require('fs');
    
    if (fs.existsSync(testdataPath)) {
      resolvedPath = testdataPath;
      ReportLogger.logInfo(`📁 Resolved file path: ${resolvedPath}`);
    } else {
      // Try from project root
      resolvedPath = path.resolve(process.cwd(), filePath);
      ReportLogger.logInfo(`📁 Resolved file path from project root: ${resolvedPath}`);
    }
  }
  
  let uploaded = false;
  
  // Strategy 1: Find by label text
  try {
    const labelLocator = this.page.locator(`text="${elementName}"`).first();
    const labelExists = await labelLocator.count();
    
    if (labelExists > 0) {
      // Look for file input near the label
      const container = labelLocator.locator('xpath=ancestor::*[contains(@class, "upload") or contains(@class, "file") or contains(@class, "field")][1]');
      const fileInput = container.locator('input[type="file"]').first();
      
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(resolvedPath);
        ReportLogger.logInfo(`✅ Uploaded file "${resolvedPath}" to "${elementName}"`);
        uploaded = true;
      }
    }
  } catch (error) {
    // Continue to next strategy
  }
  
  // Strategy 2: Direct file input selectors
  if (!uploaded) {
    const fieldName = elementName.toLowerCase();
    const strategies = [
      `input[type="file"][name*="${fieldName}"]`,
      `input[type="file"][id*="${fieldName}"]`,
      `input[type="file"][aria-label*="${elementName}" i]`,
      `label:has-text("${elementName}") input[type="file"]`,
      `input[type="file"]`, // Last resort: first file input on page
    ];
    
    for (const selector of strategies) {
      try {
        const locator = this.page.locator(selector).first();
        const count = await locator.count();
        
        if (count > 0) {
          ReportLogger.logInfo(`🎯 Found file input using: ${selector}`);
          await locator.setInputFiles(resolvedPath);
          
          // Verify the file was set
          const files = await locator.evaluate((el: any) => {
            return el.files ? Array.from(el.files).map((f: any) => f.name) : [];
          });
          
          if (files.length > 0) {
            ReportLogger.logInfo(`✅ Uploaded file "${resolvedPath}" to "${elementName}" - Files set: ${files.join(', ')}`);
            uploaded = true;
            break;
          } else {
            ReportLogger.logInfo(`⚠️ File input found but no files were set`);
          }
        }
      } catch (error: any) {
        ReportLogger.logInfo(`⚠️ Strategy failed: ${error.message}`);
        continue;
      }
    }
  }
  
  if (!uploaded) {
    throw new Error(`Could not find file upload field: ${elementName}`);
  }
});

When('I upload file {string}', async function (filePath: string) {
  ReportLogger.logInfo(`🔍 Looking for file upload field`);
  
  // Resolve file path - support relative paths from project root or testdata folder
  const path = require('path');
  let resolvedPath = filePath;
  
  // If path is not absolute, try to resolve it
  if (!path.isAbsolute(filePath)) {
    // Try testdata folder first
    const testdataPath = path.resolve(process.cwd(), 'testdata', filePath);
    const fs = require('fs');
    
    if (fs.existsSync(testdataPath)) {
      resolvedPath = testdataPath;
      ReportLogger.logInfo(`📁 Resolved file path: ${resolvedPath}`);
    } else {
      // Try from project root
      resolvedPath = path.resolve(process.cwd(), filePath);
      ReportLogger.logInfo(`📁 Resolved file path from project root: ${resolvedPath}`);
    }
  }
  
  // Find the first visible file input
  const fileInput = this.page.locator('input[type="file"]').first();
  const count = await fileInput.count();
  
  if (count > 0) {
    await fileInput.setInputFiles(resolvedPath);
    ReportLogger.logInfo(`✅ Uploaded file: ${resolvedPath}`);
  } else {
    throw new Error('Could not find file upload field');
  }
});
