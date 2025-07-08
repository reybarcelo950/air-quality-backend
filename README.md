## Project setup
 - Database: Mongodb (only need the uri on the MONGO_URI environment)

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## How to do

#### variables on endpoint
 - SERVER_ADDRESS route to the running backend project (default http://localhost:3000)
 - FILE_ADDRESS csv to import, local address of the file
 - PARAMETER field of the entity to load the values

### Import the example csv file
##### (note: must have a valid csv with the example structure [link](https://archive.ics.uci.edu/dataset/360/air+quality))
```
curl --location '[SERVER_ADDRESS]/air-quality/import' --header 'Cookie: NEXT_LOCALE=es' --form 'file=@"[FILE_ADDRESS]"'
```

### Fetch time series data for a specific parameter (e.g., CO, Benzene).
##### (note: must be a valid parameter of AirQuality scheme)
```
curl --location --request GET '[SERVER_ADDRESS]/air-quality/timeline/[PARAMETER]?from=2004-03-10&to=2004-03-15' --header 'Cookie: NEXT_LOCALE=es'
```
### Fetch data within a specific date range.
```
curl --location --request GET '[SERVER_ADDRESS]/air-quality/range/?from=2004-03-10&to=2004-03-15' --header 'Cookie: NEXT_LOCALE=es'
```
### Fetch average values within a specific date range.
##### (note: operator can be 'avg' | 'min' | 'max')
```
curl --location --request GET '[SERVER_ADDRESS]/air-quality/summary/?from=2004-03-10&to=2004-03-15&operator=avg' --header 'Cookie: NEXT_LOCALE=es'
```
