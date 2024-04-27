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
  
    // ### R8UC1 ###
    describe("R8UC1", () => {
      // test to check that the description of todo item input field is empty at start
      it('Should have an empty input field', () => {
        cy.get('form').eq(1).find('input[type=text]').should('have.value', '')
      })
  
      // The submit button should be disabled if empty field
      it('Should have a disable button when empty field', () => {
        cy.get('form').eq(1).find('input[type=submit]').should('be.disabled')
      })
  
      // test to see that the submit button is enabled when text input field is not empty
      it('Should have an enable button when field not empty', () => {
        cy.get('form').eq(1).find('input[type=text]').type('fake todo', { force: true })
        cy.get('form').eq(1).find('input[type=submit]').should('be.enabled')
      })
  
      // test to see if same added input is showing last in the todo item list.
      it('Should have same name as input last in the todo item list', () => {
        cy.get('form').eq(1).find('input[type=text]').type('hello', { force: true })
        cy.get('form').eq(1).find('input[type=submit]').click({ force: true })
        cy.get('.todo-list').get('.todo-item').last().find('span').eq(1).should('have.text', 'hello')
      })
    })
  
    //  ### R8UC2 ###
    describe("R8UC2", () => {
      // test to see if the item is struck through when the first span of the todo list item is clicked
      it('Should have a text decoration of line-trough if toggled', () => {
        cy.get('.todo-list').get('.todo-item').last().find('span').eq(0).trigger('click')
          .then(() => {
            cy.get('.todo-list').get('.todo-item').last().find('span').eq(0).should('have.class', 'checked')
            cy.get('.todo-list').get('.todo-item').last().find('.checker.checked + .editable').should('have.css', 'text-decoration', 'line-through solid rgb(49, 46, 46)')
          })
      })
  
      // test to see if the item which was  struck through is  not stuck trough anymore when clicked again
      it('Should not have text decoration of none if toggled twice', () => {
        cy.get('.todo-list').get('.todo-item').first().find('span').eq(0).trigger('click')
  
        cy.get('.todo-list').get('.todo-item').first().find('span').eq(0).trigger('click')
          .then(() => {
            cy.get('.todo-list').get('.todo-item').first().find('span').eq(0).should('have.class', 'unchecked')
            cy.get('.todo-list').get('.todo-item').first().find('.checker.unchecked + .editable').should('have.css', 'text-decoration', 'none solid rgb(49, 46, 46)')
          })
      })
    })
  
    // R8UC 3
    describe("R8UC3", () => {
      it("The user clicks on the x symbol behind the description of the todo item, the todo item is deleted.", () => {
        cy.get('.todo-list').get('.inline-form').find('input[type=text]').type('test item', { force: true });
        cy.contains('Add').click({ force: true });
        cy.wait(800);
  
        cy.get('.todo-list').get('.todo-item').last().find('span').eq(2).trigger('click')
          .then(() => {
            cy.get('.todo-list').get('.todo-item').last().find('span').eq(1).should('not.have.text', 'test item');
          })
      })
    })
  
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