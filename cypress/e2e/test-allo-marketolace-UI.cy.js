import HomePage from '../support/page-objects/home-page.js';
import NoteBooksPage from '../support/page-objects/notebooks-page.js';
import CoffeeMachinePage from '../support/page-objects/cofee-machines-page.js';
import testData from "../fixtures/input-data";

const homePage = new HomePage();
const noteBooksPage = new NoteBooksPage();
const coffeeMachinePage = new CoffeeMachinePage();

let sum = 0;

beforeEach(() => {
    cy.log(" ---------- STARTUP ---------- ");
    cy.visit('/');
});

describe('Test Allo marketplace', () => {
    it('Summary: Verify if the price filter working correctly for the Allo marketplaces', () => {
        cy.log('Verify that the marketplace URl is correct');
        cy.url().should('be.eq', Cypress.config('baseUrl'));

        cy.log("Proceed to Notebooks category");
        homePage.navigateToCategory('Ноутбуки, ПК та планшети');
        homePage.proceedToSubCategory('Ноутбуки');

        cy.log("Set up filter option: \n" +
            +"- 'Готовий до відправки' \n" +
            +"- 'Уцінений товар' \n" +
            +"- 'Prices " + testData.minPrice.toString() + " - " + testData.maxPrice.toString() + "\n");
        noteBooksPage.setReadyForDeliveryOption();
        noteBooksPage.setDiscountedOption();
        noteBooksPage.setPrices(testData.minPrice, testData.maxPrice);
        noteBooksPage.sortElements('від дорогих до дешевих');

        cy.log('Verify that the products with correct prices are dispayed on website');
        cy.get('.v-pb__cur .sum').each((item) => {
            let prices = parseInt(item.text().replace(/[^0-9.-]+/g, ''));
            expect(prices).to.be.within(testData.minPrice, testData.maxPrice);
        });
    });

    it('Summary: Add items to the basket”', () => {
        cy.log('Verify that the marketplace URl is correct');
        cy.url().should('be.eq', Cypress.config('baseUrl'));

        cy.log("Proceed to 'Ноутбуки, ПК та планшети' category");
        homePage.navigateToCategory('Ноутбуки, ПК та планшети');
        homePage.proceedToSubCategory('Ноутбуки');
        noteBooksPage.addFirstItemToTheBasket();
        noteBooksPage.closeItem();

        cy.log("Proceed to 'Побутова технікаи' category");
        cy.visit('/');
        homePage.navigateToCategory('Побутова техніка');
        homePage.proceedToSubCategory('Світ кави');
        homePage.proceedToSubCategory('Кавомашини');
        coffeeMachinePage.addFirstItemToTheBasket();
        coffeeMachinePage.closeItem();
        coffeeMachinePage.navigateToBasket();

        cy.log('Verify that the price is calculated correctly.');
        cy.get('div[class="price-box__cur"]').each((price) => {
            const text = price.text();
            sum = parseInt(text.replace(/[^0-9.-]+/g, ''));
        }).then(() => {
            cy.get('.total-box__price').then((total) => {
                const totalText = total.text();
                const totalPrice = parseInt(totalText.replace(/[^0-9.-]+/g, ''));
                expect(totalText).to.eq(sum);
            })
        });
        coffeeMachinePage.closeRemove();
        cy.log('Verify that the delete item button is clickable.');
        cy.get('.cart-popup_empty').should('contain', testData.expectedMessageBasketEmpty);
    });

    it('Search the item', () => {
        cy.log('Verify that the marketplace URl is correct');
        cy.url().should('be.eq', Cypress.config('baseUrl'));

        cy.log('Search ' + testData.expectSearchItem);
        homePage.search(testData.expectSearchItem);
        cy.get('div[class="product-card"]').wait(1000).should('have.length.gt', 0);

        cy.log('Verify that all items are correctly displayed according to "' + testData.expectSearchItem + '" searching request')
        cy.get('div[class="product-card"]').each((item) => {
            cy.wrap(item)
                .find('.product-card__title')
                .should('contain', testData.expectSearchItem);
        });
    });

    it('Login with not correct credentionals (phone number is not registered)', () => {
        cy.log('Verify that the marketplace URl is correct');
        cy.url().should('be.eq', Cypress.config('baseUrl'));

        cy.log('Enter invalid credentionals');
        homePage.login(testData.invalidPhoneNum, testData.invalidPassword);

        cy.log('Varify that correct message is displayed after not correct credentionals has been entered');
        cy.get('.auth__contact > .auth__text > :nth-child(1)').should('contain', testData.expectedMessageNotRegNum1);
        cy.get('.auth__contact > .auth__text > :nth-child(2)').should('contain', testData.expectedMessageNotRegNum2);
    });
});