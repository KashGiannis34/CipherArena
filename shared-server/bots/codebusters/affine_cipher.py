import random


def generate_affine_letter():
    """Generate an affine shift problem for one letter"""
    a = int(random.random() * 60) + 1
    b = int(random.random() * 60) + 1
    let = int(random.random() * 26) + 65
    letter = chr(let)
    answer = chr((a * (let - 65) + b) % 26 + 65)
    return {
        "type": "affine_letter",
        "problem": f"Affine: a={a}, b={b}, letter={letter}",
        "question": f"Encode the letter using the affine cipher",
        "answer": answer,
        "a": a,
        "b": b,
        "letter": letter,
        "hint": "Formula: (a × letter + b) mod 26"
    }


def check_affine_letter(a, b, letter, user_answer):
    """Check answer for affine letter shift"""
    try:
        if not isinstance(user_answer, str) or len(user_answer) == 0:
            raise ValueError("Answer must be a non-empty string")
        let = ord(letter.upper())
        correct_answer = chr((a * (let - 65) + b) % 26 + 65)
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }


def generate_affine_word():
    """Generate an affine shift problem for one word"""
    length = int(random.random() * 4) + 4
    word = ""
    for n in range(length):
        number = int(random.random() * 26) + 65
        word += chr(number)

    a = int(random.random() * 60) + 1
    while a % 2 == 0 or a % 13 == 0:
        a = int(random.random() * 60) + 1

    b = int(random.random() * 60) + 1
    while b % 2 == 0 or b % 13 == 0:
        b = int(random.random() * 60) + 1

    answer = ""
    for n in range(length):
        answer += chr((((ord(word[n]) - 65) * a + b) % 26) + 65)

    return {
        "type": "affine_word",
        "problem": f"Affine: a={a}, b={b}, word={word}",
        "question": f"Encode the \"word\" using the affine cipher",
        "answer": answer,
        "a": a,
        "b": b,
        "word": word,
        "length": length,
        "hint": "Formula: (a × letter + b) mod 26"
    }


def check_affine_word(a, b, word, user_answer):
    """Check answer for affine word shift"""
    try:
        if not isinstance(user_answer, str):
            raise ValueError("Answer must be a string")
        correct_answer = ""
        for char in word:
            correct_answer += chr((((ord(char) - 65) * a + b) % 26) + 65)
        return {
            "correct": user_answer.upper() == correct_answer,
            "user_answer": user_answer.upper(),
            "correct_answer": correct_answer
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }
