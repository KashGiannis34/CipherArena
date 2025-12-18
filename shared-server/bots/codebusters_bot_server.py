"""
Bot Server with ProcessPoolExecutor
Handles requests from Node w/ parallel processing (very cool)
"""

import sys
import json
import os
from concurrent.futures import ProcessPoolExecutor, TimeoutError as FuturesTimeout

# Pool config
POOL_SIZE = int(os.environ.get('BOT_POOL_SIZE', 4))
REQUEST_TIMEOUT = 8  # sec

# Global pool (initialized lazily)
_pool = None


def _init_worker():
    """Called once per worker at startup - preload modules"""
    import random
    import time
    from codebusters import generate_memorize_decimals
    from codebusters.__main__ import GENERATORS, check_answer

    # Store in globals for worker functions
    global _worker_random, _worker_time, _worker_generators
    global _worker_check_answer, _worker_generate_memorize

    _worker_random = random
    _worker_time = time
    _worker_generators = GENERATORS
    _worker_check_answer = check_answer
    _worker_generate_memorize = generate_memorize_decimals


def _worker_generate(problem_type, decimals=None):
    """Worker function for generate - runs in subprocess"""
    _worker_random.seed(_worker_time.time())

    if problem_type not in _worker_generators:
        return {"error": "Invalid problem type"}

    if problem_type == 15:
        return _worker_generate_memorize(decimals if decimals else -1)

    return _worker_generators[problem_type]()


def _worker_check(problem_type, problem_data, user_answer):
    """Worker function for check - runs in subprocess"""
    return _worker_check_answer(problem_type, problem_data, user_answer)


def get_pool():
    """Get or create the process pool"""
    global _pool
    if _pool is None:
        _pool = ProcessPoolExecutor(
            max_workers=POOL_SIZE,
            initializer=_init_worker
        )
        print(f"[Bot Server] Pool initialized with {POOL_SIZE} workers", file=sys.stderr)
    return _pool


def handle_generate(problem_type, decimals=None):
    """Submit generate task to pool"""
    pool = get_pool()
    future = pool.submit(_worker_generate, problem_type, decimals)
    return future.result(timeout=REQUEST_TIMEOUT)


def handle_check(problem_type, problem_data, user_answer):
    """Submit check task to pool"""
    pool = get_pool()
    future = pool.submit(_worker_check, problem_type, problem_data, user_answer)
    return future.result(timeout=REQUEST_TIMEOUT)


def get_stats():
    """Get pool statistics"""
    pool = get_pool()
    return {
        "poolSize": POOL_SIZE,
        "status": "running" if _pool else "not_started"
    }


def main():
    """Main loop - read requests from stdin, write responses to stdout"""
    print(json.dumps({"type": "ready", "data": {"status": "initialized", "poolSize": POOL_SIZE}}), flush=True)

    for line in sys.stdin:
        request_id = None
        try:
            request = json.loads(line.strip())
            action = request.get('action')
            request_id = request.get('id')

            if action == 'generate':
                problem_type = request.get('problemType')
                decimals = request.get('decimals')
                result = handle_generate(problem_type, decimals)
                response = {
                    "type": "generate_response",
                    "id": request_id,
                    "data": result
                }

            elif action == 'check':
                problem_type = request.get('problemType')
                problem_data = request.get('problemData')
                user_answer = request.get('userAnswer')
                result = handle_check(problem_type, problem_data, user_answer)
                response = {
                    "type": "check_response",
                    "id": request_id,
                    "data": result
                }

            elif action == 'ping':
                response = {
                    "type": "pong",
                    "id": request_id,
                    "data": {"status": "alive"}
                }

            elif action == 'stats':
                response = {
                    "type": "stats_response",
                    "id": request_id,
                    "data": get_stats()
                }

            else:
                response = {
                    "type": "error",
                    "id": request_id,
                    "data": {"error": f"Unknown action: {action}"}
                }

            print(json.dumps(response), flush=True)

        except FuturesTimeout:
            error_response = {
                "type": "error",
                "id": request_id,
                "data": {"error": "Request timeout"}
            }
            print(json.dumps(error_response), flush=True)

        except Exception as e:
            error_response = {
                "type": "error",
                "id": request_id,
                "data": {"error": str(e)}
            }
            print(json.dumps(error_response), flush=True)

if __name__ == '__main__':
    main()
