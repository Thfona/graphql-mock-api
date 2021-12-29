const fs = require('fs');
const path = require('path');
const easygraphqlMock = require('easygraphql-mock');
const pluralize = require('pluralize');

const mockDataSampleSize = 10;

const isObject = (value) => {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
};

const getBufferFromObject = (object) => {
  return Buffer.from(JSON.stringify(object));
};

const mockFactory = (schema) => {
  const data = [];

  for (let i = 0; i < mockDataSampleSize; i++) {
    const mock = easygraphqlMock(schema);

    data.push(mock);
  }

  return data;
};

const mockSanitizer = (array, typeName) => {
  return array.map((item) => {
    delete item[typeName].__typename;

    return item[typeName];
  });
};

const deepMockSanitizer = (object) => {
  for (const property in object) {
    if (isObject(object[property])) {
      delete object[property].__typename;

      deepMockSanitizer(object[property]);
    }

    if (Array.isArray(object[property])) {
      object[property] = object[property].map((item) => {
        if (item && item.__typename) {
          delete item.__typename;
        }

        return deepMockSanitizer(item);
      });
    }
  }

  return object;
};

exports.mockDataGenerator = () => {
  const mockDir = path.join(__dirname, 'mock');
  const dataFilePath = path.join(mockDir, 'data.json');

  if (!fs.existsSync(dataFilePath)) {
    if (!fs.existsSync(mockDir)) {
      fs.mkdirSync(mockDir);
    }

    fs.writeFileSync(dataFilePath, getBufferFromObject({}), 'utf8');
  }

  const mockData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

  if (!mockData || !Object.keys(mockData).length) {
    const schemasDir = path.join(__dirname, 'schemas');

    const schemaFiles = fs.readdirSync(schemasDir);

    const newMockData = {};

    schemaFiles.forEach((file) => {
      const schema = fs.readFileSync(path.join(schemasDir, file), 'utf8');

      const mock = mockFactory(schema);

      const typeName = Object.keys(mock[0])[0];

      const initialData = mockSanitizer(mock, typeName);

      const finalData = initialData.map((item) => deepMockSanitizer(item));

      const dataKey = pluralize(typeName.toLowerCase());

      newMockData[dataKey] = finalData;
    });

    const newMockDataBuffer = getBufferFromObject(newMockData);
    fs.writeFileSync(dataFilePath, newMockDataBuffer, 'utf8');

    return newMockData;
  }

  return mockData;
};
