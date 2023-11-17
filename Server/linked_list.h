struct ArrayList {
    int arr[100];
    int size;
};

// Function to push a new element to the array
void push(struct ArrayList *list, int newData) {
    if (list->size < 100) {
        list->arr[list->size++] = newData;
    } else {
        printf("Error: Array is full. Cannot push %d.\n", newData);
    }
}

// Function to delete a value from the array
void deleteValue(struct ArrayList *list, int value) {
    int found = 0;
    for (int i = 0; i < list->size; ++i) {
        if (list->arr[i] == value) {
            found = 1;
            // Shift elements to the left to fill the gap
            for (int j = i; j < list->size - 1; ++j) {
                list->arr[j] = list->arr[j + 1];
            }
            --list->size;
            break; // Assuming unique values, exit loop after finding the first occurrence
        }
    }

    if (!found) {
        printf("Error: Value %d not found in the array.\n", value);
    }
}

void deleteAll(struct ArrayList *list) {
    list->size = 0; // Simply reset the size to zero
}

void printArray(struct ArrayList *list) {
    for (int i = 0; i < list->size; ++i) {
        printf("%d ", list->arr[i]);
    }
    printf("\n");
}

// Function to check if a value is already in the array
int isInArray(struct ArrayList *list, int value) {
    for (int i = 0; i < list->size; ++i) {
        if (list->arr[i] == value) {
            return 1; // Value is found in the array
        }
    }
    return 0; // Value is not found in the array
}
