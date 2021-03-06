# Documentation for Contributors

## Contents

- [Intro](#intro)
- [Prerequisites](prerequisites.md)
- [Dependencies](dependencies.md)
  - [Main Dependencies](dependencies.md#main-dependencies)
  - [Development Dependencies](dependencies.md#development-dependencies)
- [Architecture](architecture.md)
  - [Contexts](architecture.md#contexts)
  - [Repositories](architecture.md#repositories)
  - [Registries](architecture.md#registries)
  - [Models](architecture.md#models)

## Intro

The Software Development Kit (SDK) is made with the purpose of managing RDF data using
familiar JavaScript/TypeScript programming techniques and tools.

The SDK centers in the nuclear RDF type given to the basic data structure in the Carbon LDP Platform,
the `c:Document`. This document is translated into a JS object with methods to
access the SDK features.

These features include:
- CRUD operations of documents
- Management of membership relations 
- SPARQL queries (parsing values and references into documents) 
- Partial reading of documents and related resources in any desired level
- Subscription to real-time notifications
