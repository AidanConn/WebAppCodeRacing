public class FindSmallest {

    // User needs to implement this method

    public static void main(String[] args) {
        // Predefined test cases
        System.out.println("Running tests for FindSmallest...");

        try {
            testFindSmallest(new int[]{5, 1, 3, 8, 2}, 1);
            testFindSmallest(new int[]{-5, -10, -1, 0}, -10);
            testFindSmallest(new int[]{10, 20, 5, 7}, 5);
            testFindSmallest(new int[]{5}, 5);

            System.out.println("All tests passed!");
        } catch (AssertionError e) {
            System.err.println(e.getMessage());
        }
    }

    // Helper method for testing
    private static void testFindSmallest(int[] input, int expected) {
        int result = findSmallest(input);
        if (result != expected) {
            throw new AssertionError("Test failed for input: " + java.util.Arrays.toString(input) + 
                ". Expected: " + expected + ", Got: " + result);
        }
    }
}
