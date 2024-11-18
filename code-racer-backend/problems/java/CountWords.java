public class CountWords {

    // User needs to implement this method

    public static void main(String[] args) {
        // Predefined test cases
        System.out.println("Running tests for CountWords...");

        try {
            testCountWords("This is a test.", 4);
            testCountWords("Hello World", 2);
            testCountWords("    ", 0);
            testCountWords("One", 1);

            System.out.println("All tests passed!");
        } catch (AssertionError e) {
            System.err.println(e.getMessage());
        }
    }

    // Helper method for testing
    private static void testCountWords(String input, int expected) {
        int result = countWords(input);
        if (result != expected) {
            throw new AssertionError("Test failed for input: \"" + input + 
                "\". Expected: " + expected + ", Got: " + result);
        }
    }
}
