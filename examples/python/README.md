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

**2. Install Dependencies:**

With the virtual environment active, install the required dependencies for the example script. This script runs the SDK directly from the source code in the `packages/python` directory.

```bash
pip install -r examples/python/requirements.txt
```

**3. Set Environment Variables (Optional):**

The example can use an API key from an environment variable.

```bash
export SECURELEND_API_KEY="sk_test_..."
```

## Running the Example

After following the setup steps above, your virtual environment should be active. You can now run the example script:

```bash
python examples/python/main.py
```

If you encounter a `ModuleNotFoundError`, it means your virtual environment is not active. You can either activate it with `source venv/bin/activate` or run the script using the Python executable from the virtual environment directly:
```bash
./venv/bin/python examples/python/main.py
```

You should see output showing the loan offers found by the SDK.
