# SecureLend Python SDK Example

This directory contains a simple example of how to use the `securelend` Python package.

## Setup

1.  **Install dependencies:**
    Make sure you have Python 3.8+ installed. It's recommended to use a virtual environment.

    ```bash
    # From the root of the monorepo
    python3 -m venv venv
    source venv/bin/activate
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
