import sys
import json
import time
import random

from codebusters import generate_memorize_decimals
from codebusters.__main__ import GENERATORS, check_answer


def handle_generate(problem_type, decimals=None):
    """Handle generate request"""
    random.seed(time.time())

    if problem_type not in GENERATORS:
        return {"error": "Invalid problem type"}

    if problem_type == 15:
        return generate_memorize_decimals(decimals if decimals else -1)

    return GENERATORS[problem_type]()


def handle_check(problem_type, problem_data, user_answer):
    """Handle check request"""
    return check_answer(problem_type, problem_data, user_answer)


def main():
    """Main loop - read requests from stdin, write responses to stdout"""
    print(json.dumps({"type": "ready", "data": {"status": "initialized"}}), flush=True)

    for line in sys.stdin:
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

            else:
                response = {
                    "type": "error",
                    "id": request_id,
                    "data": {"error": f"Unknown action: {action}"}
                }

            print(json.dumps(response), flush=True)

        except Exception as e:
            error_response = {
                "type": "error",
                "id": request.get('id') if 'request' in locals() else None,
                "data": {"error": str(e)}
            }
            print(json.dumps(error_response), flush=True)

if __name__ == "__main__":
    main()
