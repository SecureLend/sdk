# SecureLend Python SDK Example

This directory contains a simple example of how to use the `securelend` Python package.

## Setup

Make sure you have Python 3.8+ installed. It's recommended to use a virtual environment to manage dependencies.

**1. Create and Activate Virtual Environment:**

First, create a virtual environment in the root directory of the monorepo. If you already have a `venv` directory here, you can skip the creation step.

```bash
# From the root of the monorepo, create the virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate
```

**2. Install Dependencies:**

Once your virtual environment is activated, install the `securelend` package in editable mode. This links the installation to the source code in the `packages/python` directory.

```bash
pip install -e packages/python
```

2.  **Set Environment Variables (Optional):**
    The example can use an API key from an environment variable.

    ```bash
    export SECURELEND_API_KEY="sk_test_..."
    ```

## Running the Example

To run the example script, execute the following command from the root of the monorepo, ensuring you are using the Python interpreter from the virtual environment you created:

```bash
# Make sure your virtual environment is activated before running
source venv/bin/activate

# Run the script
python examples/python/main.py

# Alternatively, you can run it without activating the venv by specifying the python executable directly
./venv/bin/python examples/python/main.py
```

You should see output showing the loan offers found by the SDK.
