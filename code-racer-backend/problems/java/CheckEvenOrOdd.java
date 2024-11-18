public class CheckEvenOrOdd {

    // User needs to implement this method

    public static void main(String[] args) {
        // Predefined test cases
        System.out.println("Running tests for CheckEvenOrOdd...");

        try {
            testIsEven(4, true);
            testIsEven(7, false);
            testIsEven(0, true);
            testIsEven(-2, true);
            testIsEven(-5, false);

            System.out.println("All tests passed!");
        } catch (AssertionError e) {
            System.err.println(e.getMessage());
        }
    }

    // Helper method for testing
    private static void testIsEven(int input, boolean expected) {
        boolean result = isEven(input);
        if (result != expected) {
            throw new AssertionError("Test failed for input: " + input + 
                ". Expected: " + expected + ", Got: " + result);
        }
    }
}
