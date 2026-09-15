# 1.0.0 (2026-08-28)


### Features

* initial Proofpoint Essentials API client ([775c855](https://github.com/WYRE-AI/node-proofpoint-essentials/commit/775c8559647fc16bda52c0a4c8035e4af94cf3ce))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Release workflow no longer persists a write-scoped git credential across `npm ci`.** The release job declares `contents: write`, which overrides this repo's read-only default workflow permission, so `actions/checkout`'s default persisted credential was write-scoped and lived in `.git/config` through dependency install, build and test — readable by any compromised dependency lifecycle script. `persist-credentials: false` is semantic-release's own documented GitHub Actions recipe; it authenticates its pushes from `GITHUB_TOKEN` directly and never needed the persisted credential. (CWE-250)
