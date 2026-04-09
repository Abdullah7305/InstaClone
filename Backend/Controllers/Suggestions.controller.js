const { extractSuggestions } = require('../Services/suggestions.services')

exports.getSuggestions = async (req, res) => {
    try {
        const userId = req.params.userId;
     
        const suggestions = await extractSuggestions(userId);
    
        return res.status(200).json({ message: 'Success', suggestions: suggestions });

    } catch (error) {
        return res.status(200).json({ message: 'Success' })
    }
}