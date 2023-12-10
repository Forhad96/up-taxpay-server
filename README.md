# union-project-backend

### Installation of Required Modules
To install the necessary modules used in this code, run the following command in your project directory:

```bash
npm install express cors jwt cookie-parser dotenv mongodb
```

# Backend API Documentation

This backend provides various API endpoints to interact with different collections in the MongoDB database. Below are the details of the available APIs:

### `GET /collection/:type`

Retrieves data from a specified collection (house, business, village, user, tax) with optional pagination parameters for page and size.

### `GET /collection/:type/:id`

Retrieves a specific item from the specified collection based on the provided ID.

### `POST /login`

Authenticates a user with email and issues a JWT token stored in a cookie.

### `POST /logout`

Logs out the user by clearing the JWT token from the cookie.

### `POST /collection/:type`

Inserts a new document into the specified collection (house, business, village, user, tax).

### `PUT /collection/:type/:id`

Updates a specific document in the specified collection based on the provided ID.

### `DELETE /collection/:type/:id`

Deletes a specific document from the specified collection based on the provided ID.

#### Notes

- The `:type` parameter should be one of the collection names: house, business, village, user, or tax.
- Pagination for `GET /collection/:type` can be managed using the `page` and `size` query parameters.
- Ensure proper authentication by first logging in using the `/login` endpoint to access restricted APIs.
- Replace `:id` in endpoints like `/collection/:type/:id` with the actual document ID.

