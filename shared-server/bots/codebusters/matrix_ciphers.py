import random


def _generate_valid_matrix():
    """Generate a valid 2x2 matrix with non-zero determinant coprime to 26"""
    key = []
    for n in range(4):
        key.append(int(random.random() * 26) + 1)
    det = (key[0] * key[3] - key[1] * key[2]) % 26

    while det % 2 == 0 or det % 13 == 0:
        key.clear()
        for n in range(4):
            key.append(int(random.random() * 26) + 1)
        det = (key[0] * key[3] - key[1] * key[2]) % 26

    return key, det


def _compute_inverse_matrix(key):
    """Compute the inverse of a 2x2 matrix mod 26"""
    det = (key[0] * key[3] - key[1] * key[2]) % 26

    # Find modular inverse of determinant
    for n in range(1, 26):
        if (n * det) % 26 == 1:
            det = n
            break

    inverse = [key[3], -key[1], -key[2], key[0]]
    for n in range(4):
        inverse[n] *= det
        inverse[n] %= 26

    return inverse


def generate_inverse_matrix():
    """Generate an inverse matrix problem"""
    key, _ = _generate_valid_matrix()
    inverse = _compute_inverse_matrix(key)

    return {
        "type": "inverse_matrix",
        "problem": f"Matrix: [[{key[0]}, {key[1]}], [{key[2]}, {key[3]}]]",
        "question": "What is the inverse key of this matrix?",
        "matrix": key,
        "answer": inverse,
        "matrix_display": f"{key[0]}\t{key[1]}\n{key[2]}\t{key[3]}"
    }


def check_inverse_matrix(matrix, user_answer):
    """Check answer for inverse matrix"""
    try:
        if not isinstance(user_answer, list) or len(user_answer) != 4:
            raise ValueError("Answer must be a list of 4 numbers")

        user_answer = [int(x) for x in user_answer]
        inverse = _compute_inverse_matrix(matrix)

        return {
            "correct": user_answer == inverse,
            "user_answer": user_answer,
            "correct_answer": inverse
        }
    except (ValueError, TypeError, AttributeError) as e:
        return {
            "error": f"Invalid input: {str(e)}",
            "correct": False,
            "user_answer": user_answer
        }


def generate_hill_word():
    """Generate a Hill cipher encoding problem"""
    length = int(random.random() * 4) + 4
    word = ""
    for n in range(length):
        number = int(random.random() * 26) + 65
        word += chr(number)

    key, _ = _generate_valid_matrix()

    answer = ""
    for n in range(length):
        if n == length - 1:
            answer += chr((key[0] * (ord(word[n]) - 65)) % 26 + 65)
        elif n % 2 == 0:
            answer += chr((key[0] * (ord(word[n]) - 65) + key[1] * (ord(word[n + 1]) - 65)) % 26 + 65)
        else:
            answer += chr((key[2] * (ord(word[n - 1]) - 65) + key[3] * (ord(word[n]) - 65)) % 26 + 65)

    return {
        "type": "hill_word",
        "problem": f"Matrix: [[{key[0]}, {key[1]}], [{key[2]}, {key[3]}]], word={word}",
        "question": f"Encode the \"word\" {word} using the matrix key",
        "answer": answer,
        "matrix": key,
        "matrix_display": f"{key[0]}\t{key[1]}\n{key[2]}\t{key[3]}",
        "word": word,
        "length": length
    }


def check_hill_word(matrix, word, user_answer):
    """Check answer for Hill cipher encoding"""
    try:
        if not isinstance(user_answer, str):
            raise ValueError("Answer must be a string")
        key = matrix
        length = len(word)
        correct_answer = ""
        for n in range(length):
            if n == length - 1:
                correct_answer += chr((key[0] * (ord(word[n]) - 65)) % 26 + 65)
            elif n % 2 == 0:
                correct_answer += chr((key[0] * (ord(word[n]) - 65) + key[1] * (ord(word[n + 1]) - 65)) % 26 + 65)
            else:
                correct_answer += chr((key[2] * (ord(word[n - 1]) - 65) + key[3] * (ord(word[n]) - 65)) % 26 + 65)

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
