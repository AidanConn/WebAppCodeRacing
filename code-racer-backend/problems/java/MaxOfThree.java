public class MaxOfThree {

    // User needs to implement this method

    public static void main(String[] args) {
        // Predefined test cases
        System.out.println("Running tests for MaxOfThree...");

        try {
            testMaxOfThree(3, 7, 5, 7);
            testMaxOfThree(-1, -5, -3, -1);
            testMaxOfThree(10, 10, 10, 10);
            testMaxOfThree(0, 100, -50, 100);
            testMaxOfThree(-10, -20, -30, -10);

            System.out.println("All tests passed!");
        } catch (AssertionError e) {
            System.err.println(e.getMessage());
        }
    }

    // Helper method for testing
    private static void testMaxOfThree(int a, int b, int c, int expected) {
        int result = maxOfThree(a, b, c);
        if (result != expected) {
            throw new AssertionError("Test failed for inputs: " + a + ", " + b + ", " + c +
                ". Expected: " + expected + ", Got: " + result);
        }
    }
}

