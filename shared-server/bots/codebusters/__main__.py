import random
import time
import json
import sys

from . import *


GENERATORS = {
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
    15: generate_memorize_decimals,
    16: generate_atbash_letter,
    17: generate_atbash_word,
    18: generate_nihilist_encode,
    19: generate_nihilist_decode,
    20: generate_nihilist_keyword_decode,
}


def check_answer(problem_type, problem_data, user_answer):
    """Check an answer for a given problem type"""
    if problem_type == 1:
        return check_two_digit_multiplication(problem_data['a'], problem_data['b'], user_answer)
    elif problem_type == 2:
        return check_letter_to_value(problem_data['letter'], user_answer)
    elif problem_type == 3:
        return check_three_digit_subtraction(problem_data['a'], problem_data['b'], user_answer)
    elif problem_type == 4:
        return check_shift_letter(problem_data['letter'], problem_data['shift'], user_answer)
    elif problem_type == 5:
        return check_shift_word(problem_data['word'], problem_data['shift'], user_answer)
    elif problem_type == 6:
        return check_inverse_matrix(problem_data['matrix'], json.loads(user_answer) if isinstance(user_answer, str) else user_answer)
    elif problem_type == 7:
        return check_mod_26(problem_data['number'], user_answer)
    elif problem_type == 8:
        return check_modular_inverse(problem_data['number'], user_answer)
    elif problem_type == 9:
        return check_affine_letter(problem_data['a'], problem_data['b'], problem_data['letter'], user_answer)
    elif problem_type == 10:
        return check_affine_word(problem_data['a'], problem_data['b'], problem_data['word'], user_answer)
    elif problem_type == 11:
        return check_hill_word(problem_data['matrix'], problem_data['word'], user_answer)
    elif problem_type == 12:
        return check_baconian(problem_data['binary'], user_answer)
    elif problem_type == 13:
        return check_binary_to_decimal(problem_data['binary'], user_answer)
    elif problem_type == 14:
        return check_remainder_cheese(problem_data['number'], user_answer)
    elif problem_type == 15:
        return check_memorize_decimals(problem_data['decimal'], user_answer)
    elif problem_type == 16:
        return check_atbash_letter(problem_data['letter'], user_answer)
    elif problem_type == 17:
        return check_atbash_word(problem_data['word'], user_answer)
    elif problem_type == 18:
        return check_nihilist_encode(problem_data['table'], problem_data['letter'], user_answer)
    elif problem_type == 19:
        return check_nihilist_decode(problem_data['table'], problem_data['number'], user_answer)
    elif problem_type == 20:
        return check_nihilist_keyword_decode(
            problem_data['table'],
            problem_data['ciphertext_number'],
            problem_data['keyword_letter'],
            user_answer
        )
    else:
        return {"error": "Invalid problem type"}


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command specified"}))
        return

    command = sys.argv[1]
    random.seed(time.time())

    try:
        if command == "generate":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "No problem type specified"}))
                return

            problem_type = int(sys.argv[2])

            if problem_type not in GENERATORS:
                print(json.dumps({"error": "Invalid problem type"}))
                return

            if problem_type == 15:
                decimals = int(sys.argv[3]) if len(sys.argv) > 3 else -1
                result = generate_memorize_decimals(decimals)
            else:
                result = GENERATORS[problem_type]()

            print(json.dumps(result))

        elif command == "check":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "No problem type specified"}))
                return

            problem_type = int(sys.argv[2])

            if len(sys.argv) < 5:
                print(json.dumps({"error": "Missing problem data or user answer"}))
                return

            problem_data = json.loads(sys.argv[3])
            user_answer = sys.argv[4]

            result = check_answer(problem_type, problem_data, user_answer)
            print(json.dumps(result))

        else:
            print(json.dumps({"error": "Invalid command. Use 'generate' or 'check'"}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))


if __name__ == "__main__":
    main()
