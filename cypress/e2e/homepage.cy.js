describe('Netflix Homepage UI + API coverage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads hero section and content rows from API', () => {
    cy.get('#heroTitle').should('contain.text', 'Wednesday');
    cy.get('.content-row').should('have.length.at.least', 2);
    cy.get('.card').should('have.length.at.least', 10);
  });

  it('searches titles and shows matching cards', () => {
    cy.get('#searchInput').type('Lupin');
    cy.get('.row-title').should('contain.text', 'Search results');
    cy.get('.card').should('have.length', 1);
    cy.get('.card h4').first().should('contain.text', 'Lupin');
  });

  it('shows empty search result state when no title matches', () => {
    cy.get('#searchInput').type('NoSuchTitleEver');
    cy.get('.row-title').should('contain.text', 'Search results (0)');
    cy.get('.card').should('have.length', 0);
  });

  it('submits subscription form successfully', () => {
    cy.get('#email').type('qa.user@example.com');
    cy.get('#plan').select('premium');
    cy.get('#subscribeForm').submit();
    cy.get('#subscriptionMessage').should('contain.text', 'Subscription created');
    cy.get('#subscriptionMessage').should('contain.text', 'qa.user@example.com');
  });

  it('shows validation error for invalid subscription payload', () => {
    cy.get('#email').type('bad-email');
    cy.get('#plan').select('basic');
    cy.get('#subscribeForm').submit();
    cy.get('#subscriptionMessage').should('contain.text', 'Valid email is required');
  });

  it('API health endpoint returns ok', () => {
    cy.request('/api/health').its('body').should('deep.include', {
      status: 'ok',
      service: 'netflix-homepage-api'
    });
  });

  it('API search endpoint returns 400 without query', () => {
    cy.request({
      url: '/api/search',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.contain('Query param q is required');
    });
  });
});
