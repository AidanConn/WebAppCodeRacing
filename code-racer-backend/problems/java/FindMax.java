public class FindMax {

    // User needs to implement this method

    public static void main(String[] args) {
        // Predefined test cases
        System.out.println("Running tests for FindMax...");

        try {
            testFindMax(new int[]{1, 2, 3, 4, 5}, 5);
            testFindMax(new int[]{-1, -2, -3}, -1);
            testFindMax(new int[]{7, 3, 9}, 9);
            testFindMax(new int[]{10, 10, 10}, 10);

            System.out.println("All tests passed!");
        } catch (AssertionError e) {
            System.err.println(e.getMessage());
        }
    }

    // Helper method for testing
    private static void testFindMax(int[] input, int expected) {
        int result = findMax(input);
        if (result != expected) {
            throw new AssertionError("Test failed for input: " + java.util.Arrays.toString(input) + 
                ". Expected: " + expected + ", Got: " + result);
        }
    }
}

