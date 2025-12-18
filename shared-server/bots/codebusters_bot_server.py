import sys
import json
import time
import random

from codebusters_bot import (
    generate_two_digit_multiplication,
    generate_letter_to_value,
    generate_three_digit_subtraction,
    generate_shift_letter,
    generate_shift_word,
    generate_inverse_matrix,
    generate_mod_26,
    generate_modular_inverse,
    generate_affine_letter,
    generate_affine_word,
    generate_hill_word,
    generate_baconian,
    generate_binary_to_decimal,
    generate_remainder_cheese,
    generate_memorize_decimals,
    generate_atbash_letter,
    generate_atbash_word,
    generate_nihilist_encode,
    generate_nihilist_decode,
    generate_nihilist_keyword_decode,
    check_two_digit_multiplication,
    check_letter_to_value,
    check_three_digit_subtraction,
    check_shift_letter,
    check_shift_word,
    check_inverse_matrix,
    check_mod_26,
    check_modular_inverse,
    check_affine_letter,
    check_affine_word,
    check_hill_word,
    check_baconian,
    check_binary_to_decimal,
    check_remainder_cheese,
    check_memorize_decimals,
    check_atbash_letter,
    check_atbash_word,
    check_nihilist_encode,
    check_nihilist_decode,
    check_nihilist_keyword_decode
)

def handle_generate(problem_type, decimals=None):
    """Handle generate request"""
    random.seed(time.time())

    generators = {
        1: generate_two_digit_multiplication,
        2: generate_letter_to_value,
        3: generate_three_digit_subtraction,
        4: generate_shift_letter,
        5: generate_shift_word,
        6: generate_inverse_matrix,
        7: generate_mod_26,
        8: generate_modular_inverse,
        9: generate_affine_letter,
        10: generate_affine_word,
        11: generate_hill_word,
        12: generate_baconian,
        13: generate_binary_to_decimal,
        14: generate_remainder_cheese,
        15: lambda: generate_memorize_decimals(decimals if decimals else -1),
        16: generate_atbash_letter,
        17: generate_atbash_word,
        18: generate_nihilist_encode,
        19: generate_nihilist_decode,
        20: generate_nihilist_keyword_decode
    }

    generator = generators.get(problem_type)
    if generator:
        return generator()
    else:
        return {"error": "Invalid problem type"}

def handle_check(problem_type, problem_data, user_answer):
    """Handle check request"""
    checkers = {
        1: lambda: check_two_digit_multiplication(problem_data['a'], problem_data['b'], user_answer),
        2: lambda: check_letter_to_value(problem_data['letter'], user_answer),
        3: lambda: check_three_digit_subtraction(problem_data['a'], problem_data['b'], user_answer),
        4: lambda: check_shift_letter(problem_data['letter'], problem_data['shift'], user_answer),
        5: lambda: check_shift_word(problem_data['word'], problem_data['shift'], user_answer),
        6: lambda: check_inverse_matrix(problem_data['matrix'], user_answer),
        7: lambda: check_mod_26(problem_data['number'], user_answer),
        8: lambda: check_modular_inverse(problem_data['number'], user_answer),
        9: lambda: check_affine_letter(problem_data['a'], problem_data['b'], problem_data['letter'], user_answer),
        10: lambda: check_affine_word(problem_data['a'], problem_data['b'], problem_data['word'], user_answer),
        11: lambda: check_hill_word(problem_data['matrix'], problem_data['word'], user_answer),
        12: lambda: check_baconian(problem_data['binary'], user_answer),
        13: lambda: check_binary_to_decimal(problem_data['binary'], user_answer),
        14: lambda: check_remainder_cheese(problem_data['number'], user_answer),
        15: lambda: check_memorize_decimals(problem_data['decimal'], user_answer),
        16: lambda: check_atbash_letter(problem_data['letter'], user_answer),
        17: lambda: check_atbash_word(problem_data['word'], user_answer),
        18: lambda: check_nihilist_encode(problem_data['table'], problem_data['letter'], user_answer),
        19: lambda: check_nihilist_decode(problem_data['table'], problem_data['number'], user_answer),
        20: lambda: check_nihilist_keyword_decode(problem_data['table'], problem_data['ciphertext_number'], problem_data['keyword_letter'], user_answer)
    }

    checker = checkers.get(problem_type)
    if checker:
        return checker()
    else:
        return {"error": "Invalid problem type"}

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
