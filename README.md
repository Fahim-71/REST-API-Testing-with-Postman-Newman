# REST API Testing with Postman & Newman

Postman collection of **13 requests / 26 assertions** that tests a User REST API (login, CRUD, validation,
authorization). A small dependency-free Node.js mock API (`mock-api/server.js`) is included as the system under
test, so everything runs locally. The collection is executed from the command line with **Newman**
and produces an HTML report.

## What is tested
| Group | Checks |
|---|---|
| Authentication | valid login returns token (saved to a variable), wrong password -> 401 |
| Users CRUD | GET all (schema + array), POST create (chained `userId`), GET by id, PUT update, DELETE (204), GET deleted -> 404 |
| Negative & security | no token -> 401, invalid email -> 400, missing field -> 400, unknown id/endpoint -> 404 |

Postman features used: environments, collection variables, request chaining, `pm.test` assertions on status
code / headers / JSON body / response time, Bearer-token authorization.

## Run
```bash
npm install
npm start            # terminal 1 - starts the API on :3000
npm test             # terminal 2 - runs Newman, report in reports/report.html
```
You can also import `postman/user-api.postman_collection.json` and `postman/local.postman_environment.json` into Postman.
