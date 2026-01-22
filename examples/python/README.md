# SecureLend Python SDK Example

This directory contains a simple example of how to use the `securelend` Python package.

## Setup

This guide assumes you are in the root directory of the monorepo.

**1. Create and Activate a Virtual Environment:**

First, create a virtual environment. This ensures that dependencies are isolated from your system Python.

```bash
python3 -m venv venv
```

Next, activate it. Your shell prompt should change to indicate that the virtual environment is active.

```bash
source venv/bin/activate
```

**2. Install the Python SDK:**

Install the `securelend` package in editable mode using the `pip` from your virtual environment. This ensures all dependencies from `pyproject.toml` are installed into the correct environment.

```bash
./venv/bin/pip install -e packages/python
```

**3. Set Environment Variables (Optional):**

The example can use an API key from an environment variable.

```bash
export SECURELEND_API_KEY="sk_test_..."
```

## Running the Example

After following the setup steps, run the example script using the Python executable from your virtual environment to ensure it can find the installed package.

```bash
./venv/bin/python examples/python/main.py
```

You should see output showing the loan offers found by the SDK.
