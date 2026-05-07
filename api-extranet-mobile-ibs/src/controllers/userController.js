const { execSP } = require('../services/dbService');

/**
 * Controller to handle user logic
 */
const userController = {
    /**
     * Get user details by ID
     */
    getUser: async (req, res) => {
        try {
            // Extract parameters from body or query
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Parameter [userId] is required' 
                });
            }

            // Call generic SP executor
            // The params object keys must match the SP parameter names (without @)
            const data = await execSP('sp_getuser', { userId });

            res.json({
                success: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({ 
                success: false, 
                message: 'Internal Server Error', 
                error: err.message 
            });
        }
    },

    /**
     * Example: Create or update user
     */
    saveUser: async (req, res) => {
        try {
            const params = req.body;
            // Example of dynamic parameter mapping
            const result = await execSP('sp_saveuser', params);

            res.status(201).json({
                success: true,
                message: 'User processed successfully',
                data: result
            });
        } catch (err) {
            res.status(500).json({ 
                success: false, 
                message: err.message 
            });
        }
    }
};

module.exports = userController;
