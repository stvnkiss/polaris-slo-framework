from main import Context
from query import polaris


def handle(context: Context):
    # TODO query data based on config and the request body
    return polaris.handle(context)
