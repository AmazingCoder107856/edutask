describe('Test to se if we can manipulating a todolist', () => {
  let uid // user id
  let email // email of the user
  let title // title of the task
  let task

  //  ###
  //    SETUP
  //          ###
  before(function () {
    // create a fabricated user from a fixture
    cy.fixture('user.json')
      .then((user) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid
          email = user.email
        })
      })

  })

  //  ###
  //    SETUP 2
  //        ###
  before(function () {
    // create a fabricated task from a fixture
    cy.fixture('task.json')
      .then((task) => {
        task.userid = uid
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/tasks/create',
          form: true,
          body: task
        }).then((response) => {
          title = task.title
        })
      })
  })

  //         ###
  //     PRE CONDITIONS
  //          ###
   //          ###
  beforeEach(function () {
    // enter the main page
    cy.visit('http://localhost:3000')
    //If error by testing occur, see is user still exist. Delete and recreate user and initial item.
    cy.request({
      method: 'GET',
      url: `http://localhost:5000/users/${uid}`,
      failOnStatusCode: false
  }).then((response) => {
      if (response.status === 200) {
        cy.request({
          method: 'DELETE',
          url: `http://localhost:5000/users/${uid}`
        }).then((response) => {
          cy.log(response.body)
        })
      }

      cy.fixture('user.json')
      .then((user) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid
          email = user.email
        })
      })
    cy.log(`user: ${response.body.email} has been created`)

    cy.fixture('task.json')
    .then((task) => {
      task.userid = uid
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/tasks/create',
        form: true,
        body: task
      }).then((response) => {
        title = task.title
      })

    // PRECONDITION 1 - Usr autenticated
    // detect a div which contains "Email Address", find the input and type (in a declarative way)
    cy.contains('div', 'Email Address')
    .find('input[type=text]')
    .type(email)
    // submit the form on this page
    cy.get('form')
      .submit()
    // assert that the user is now logged in

  // PRECONDITION 2 - At least 1 task created
  // Happens in fixture (task.json)

    // PRECONDITION 3 - views the created task in detail view mode
    cy.contains('div', title)
    .click()
    })
    })
  })

  //  Now all the preconditions are set. We have logged in with auth user. 
  //  We have created a task and we have clicked on it so it shows in detail view mode
  //  Now lets start the tests.

  // R8UC1: Create a To-Do Item
  describe('Create To-Do Item', () => {
    it('should navigate to the task creation page', () => {
      cy.visit('/tasks');
      cy.get('[data-cy=create-task]').click();
      cy.url().should('include', '/tasks/new');
    });
  
    it('should create a new to-do item', () => {
      cy.visit('/tasks/new');
      cy.get('[data-cy=todo-input]').type('New To-Do Item');
      cy.get('[data-cy=save-todo]').click();
      cy.get('[data-cy=todo-list]').should('contain', 'New To-Do Item');
    });
  
    it('should display an error for empty to-do item', () => {
      cy.visit('/tasks/new');
      cy.get('[data-cy=save-todo]').click();
      cy.get('[data-cy=error-message]').should('contain', 'Description cannot be empty');
    });
  });  
  
  // R8UC2: Toggle a To-Do Item
  describe('Toggle To-Do Item', () => {
    it('should mark a to-do item as completed', () => {
      cy.visit('/tasks');
      cy.get('[data-cy=todo-item]').first().find('[data-cy=toggle-complete]').click();
      cy.get('[data-cy=todo-item]').first().should('have.class', 'completed');
    });
  
    it('should unmark a completed to-do item', () => {
      cy.visit('/tasks');
      cy.get('[data-cy=todo-item]').first().find('[data-cy=toggle-complete]').click();
      cy.get('[data-cy=todo-item]').first().should('not.have.class', 'completed');
    });
  });

  // R8UC3: Delete a To-Do Item
  describe('Delete To-Do Item', () => {
    it('should delete a to-do item', () => {
      cy.visit('/tasks');
      cy.get('[data-cy=todo-item]').first().find('[data-cy=delete-todo]').click();
      cy.get('[data-cy=confirm-delete]').click();
      cy.get('[data-cy=todo-list]').should('not.contain', 'New To-Do Item');
    });
  });  

  after(function () {
    // clean up by deleting the user from the database
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${uid}`
    }).then((response) => {
      cy.log(response.body)
    })
  })
})