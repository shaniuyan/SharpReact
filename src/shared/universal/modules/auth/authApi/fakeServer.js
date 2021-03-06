
let users
let localStorage

// If we're testing, use a local storage polyfill
if (process.env.IS_NODE===true) {
  localStorage = require('localStorage')
} else {
  // If not, use the browser one
  localStorage = global.window.localStorage
}

let server = {
  /**
  * Populates the users, similar to seeding a database in the real world
  */
  init () {
    if (localStorage.users === undefined || !localStorage.encrypted) {
      // Set default user
      let juan = 'juan'
     let juanPass = 'juanpass'

      users = {
        [juan]: juanPass
      }

      localStorage.users = JSON.stringify(users)
      localStorage.encrypted = true
    } else {
      users = JSON.parse(localStorage.users)
    }
  },
 /**
 * Pretends to log a user in
 *
 * @param  {string} username The username of the user
 * @param  {string} password The password of the user
 */
  login (username, password) {
    let userExists = this.doesUserExist(username)

    return new Promise((resolve, reject) => {
      // If the user exists and the password fits log the user in and resolve
      if (userExists && password === users[username]) {
        resolve({
          authenticated: true,
          // Fake a random token
          token: Math.random().toString(36).substring(7)
        })
      } else {
        // Set the appropiate error and reject
        let error

        if (userExists) {
          error = new Error('Wrong password')
        } else {
          error = new Error('User doesn\'t exist')
        }

        reject(error)
      }
    })
  },
 /**
 * Pretends to register a user
 *
 * @param  {string} username The username of the user
 * @param  {string} password The password of the user
 */
  register (username, password) {
    return new Promise((resolve, reject) => {
      // If the username isn't used, hash the password with bcrypt to store it in localStorage
      if (!this.doesUserExist(username)) {
        users[username] = password
        localStorage.users = JSON.stringify(users)

        // Resolve when done
        resolve({registered: true})
      } else {
        // Reject with appropiate error
        reject(new Error('Username already in use'))
      }
    })
  },
 /**
 * Pretends to log a user out and resolves
 */
  logout () {
    return new Promise(resolve => {
      localStorage.removeItem('token')
      resolve(true)
    })
  },
 /**
 * Checks if a username exists in the db
 * @param  {string} username The username that should be checked
 */
  doesUserExist (username) {
    return !(users[username] === undefined)
  }
}

server.init()

export default server
