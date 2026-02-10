import random
from .constants import MODULAR_INVERSE_NUMS, MODULAR_INVERSE_VALUES, BINARY_KEYS


def generate_two_digit_multiplication():
    """Generate a 2-digit multiplication problem"""
    a = int(random.random() * 16) + 10
    b = int(random.random() * 21) + 5
    return {
        "type": "two_digit_multiplication",
        "problem": f"{a} * {b}",
        "question": f"What is ({a} * {b}) mod 26?",
        "answer": a * b,
        "answer_mod_26": (a * b) % 26,
        "a": a,
        "b": b
    }


def check_two_digit_multiplication(a, b, user_answer):
    """Check answer for 2-digit multiplication"""
    try:
        user_answer_int = int(user_answer)
        correct_answer_1 = str(a * b) + " mod 26"
        correct_answer_2 = (a * b) % 26

        return {
            "correct": user_answer_int == correct_answer_2,
            "user_answer": user_answer,
            "correct_answer": correct_answer_1,
            "correct_answer_mod_26": correct_answer_2
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a number",
            "correct": False,
            "user_answer": user_answer
        }


def generate_letter_to_value():
    """Generate a letter to value conversion problem"""
    number = int(random.random() * 26) + 65
    letter = chr(number)
    return {
        "type": "letter_to_value",
        "problem": letter,
        "question": f"What is the value of {letter}?",
        "answer": number - 65,
        "letter": letter
    }


def check_letter_to_value(letter, user_answer):
    """Check answer for letter to value conversion"""
    try:
        user_answer_int = int(user_answer)
        correct_answer = ord(letter.upper()) - 65
        return {
            "correct": user_answer_int == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a number",
            "correct": False,
            "user_answer": user_answer
        }


def generate_three_digit_subtraction():
    """Generate a 3-digit subtraction problem"""
    a = int(random.random() * 625) + 1
    b = int(random.random() * 625) + 1
    return {
        "type": "three_digit_subtraction",
        "problem": f"{a} - {b}",
        "question": f"What is {a} - {b}?",
        "answer": a - b,
        "a": a,
        "b": b
    }


def check_three_digit_subtraction(a, b, user_answer):
    """Check answer for 3-digit subtraction"""
    try:
        user_answer_int = int(user_answer)
        correct_answer = a - b
        return {
            "correct": user_answer_int == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a number",
            "correct": False,
            "user_answer": user_answer
        }


def generate_mod_26():
    """Generate a mod 26 problem"""
    n = int(random.random() * (625 + 100 + 1)) - 100
    return {
        "type": "mod_26",
        "problem": f"{n} mod 26",
        "question": f"What is {n} mod 26?",
        "answer": n % 26,
        "number": n
    }


def check_mod_26(number, user_answer):
    """Check answer for mod 26"""
    try:
        user_answer_int = int(user_answer)
        correct_answer = number % 26
        return {
            "correct": user_answer_int == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a number",
            "correct": False,
            "user_answer": user_answer
        }


def generate_modular_inverse():
    """Generate a modular inverse problem"""
    n = int(random.random() * 12)
    return {
        "type": "modular_inverse",
        "problem": f"Inverse of {MODULAR_INVERSE_NUMS[n]} mod 26",
        "question": f"What is the modular inverse of {MODULAR_INVERSE_NUMS[n]}?",
        "answer": MODULAR_INVERSE_VALUES[n],
        "number": MODULAR_INVERSE_NUMS[n]
    }


def check_modular_inverse(number, user_answer):
    """Check answer for modular inverse"""
    try:
        user_answer_int = int(user_answer)

        if number in MODULAR_INVERSE_NUMS:
            correct_answer = MODULAR_INVERSE_VALUES[MODULAR_INVERSE_NUMS.index(number)]
        else:
            return {"error": "Invalid number for modular inverse"}

        return {
            "correct": user_answer_int == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError):
        return {
            "error": "Invalid input: answer must be a number",
            "correct": False,
            "user_answer": user_answer
        }


def generate_binary_to_decimal():
    """Generate a binary to decimal conversion problem"""
    r34 = int(random.random() * 24)
    binary = BINARY_KEYS[r34]
    answer = str(r34)

    return {
        "type": "binary_to_decimal",
        "problem": binary,
        "question": f"What is the decimal value for {binary}?",
        "answer": answer,
        "binary": binary,
        "decimal": r34
    }


def check_binary_to_decimal(binary, user_answer):
    """Check answer for binary to decimal conversion"""
    try:
        user_answer_str = str(user_answer)
        correct_answer = str(int(binary, 2))
        return {
            "correct": user_answer_str == correct_answer,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }


def generate_remainder_cheese(show_decimal=True):
    """Generate a remainder cheese problem (mod 26 with decimal hint)"""
    n = int(random.random() * (625 + 100 + 1)) - 100
    decimal_value = n / 26.0

    return {
        "type": "remainder_cheese",
        "problem": f"{n} mod 26",
        "question": f"What is {n} mod 26?" + (f" ({n}/26 = {decimal_value})" if show_decimal else ""),
        "answer": n % 26,
        "number": n,
        "decimal": decimal_value,
        "answer_letter": chr((n % 26) + 65)
    }


def check_remainder_cheese(number, user_answer):
    """Check answer for remainder cheese"""
    try:
        correct_answer = number % 26

        if isinstance(user_answer, str) and not user_answer.isnumeric():
            if len(user_answer) == 0:
                raise ValueError("Answer cannot be empty")
            user_value = ord(user_answer.upper()[0]) - 65
            correct = user_value == correct_answer
        else:
            user_answer_int = int(user_answer)
            correct = user_answer_int == correct_answer

        return {
            "correct": correct,
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "correct_answer_letter": chr(correct_answer + 65)
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }


def generate_memorize_decimals(decimals=-1):
    """Generate a memorize mod 26 decimals problem"""
    n = int(random.random() * 25) + 1
    decimal_value = n / 26.0
    index = str(decimal_value).index('.')

    if decimals == -1:
        str_n = str(decimal_value)
    else:
        str_n = str(decimal_value)[0:index + decimals + 1]

    reference = []
    for num in range(1, 26):
        idx = str(num / 26.0).index('.')
        reference.append({
            "number": num,
            "decimal": str(num / 26.0)[0:idx + 3]
        })

    return {
        "type": "memorize_decimals",
        "problem": str_n,
        "question": f"What is the mod 26 remainder for {str_n}?",
        "answer": n % 26,
        "decimal": str_n,
        "answer_letter": chr((n % 26) + 65),
        "reference_table": reference
    }


def check_memorize_decimals(decimal_str, user_answer):
    """Check answer for memorize decimals"""
    try:
        n = None
        for num in range(1, 26):
            if str(num / 26.0).startswith(decimal_str):
                n = num
                break

        if n is None:
            return {"error": "Could not determine number from decimal"}

        correct_answer = n % 26

        if isinstance(user_answer, str) and not user_answer.isnumeric():
            if len(user_answer) == 0:
                raise ValueError("Answer cannot be empty")
            user_value = ord(user_answer.upper()[0]) - 65
            correct = user_value == correct_answer
        else:
            user_answer_int = int(user_answer)
            correct = user_answer_int == correct_answer

        return {
            "correct": correct,
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "correct_answer_letter": chr(correct_answer + 65)
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }
