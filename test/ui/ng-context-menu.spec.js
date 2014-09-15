describe('Right clicking on a panel', function() {
  it('should display a contextmenu', function() {
    browser.get('http://localhost:8080/');

    var panel = element(by.css('.panel:first-of-type'));
    var menu = element(by.id('myMenu0'));

    expect(menu.isPresent()).toBe(true);
    expect(menu.isDisplayed()).toBe(false);

//    browser.actions().mouseMove(panel).perform();
//    browser.actions().click(protractor.Button.RIGHT).perform();

    expect(menu.isDisplayed()).toBe(true);
  });
});