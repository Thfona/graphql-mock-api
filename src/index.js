const express = require('express');
const cors = require('cors');
const jsonGraphqlExpress = require('json-graphql-server');
const { mockDataGenerator } = require('./functions');

const data = mockDataGenerator();

const PORT = 3000;

const app = express();

app.use(cors());

app.use('/graphql', jsonGraphqlExpress.default(data));

app.listen(PORT, () => {
  console.log(`Ready on http://localhost:${PORT}/graphql`);
});
