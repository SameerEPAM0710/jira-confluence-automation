from operations import add, subtract


def main():
    first = 10
    second = 4
    print(f"{first} + {second} = {add(first, second)}")
    print(f"{first} - {second} = {subtract(first, second)}")


if __name__ == "__main__":
    main()