exports.getOverview = (req, res) => {
    res.status(200).render('overview', {
        title: 'All tours'
    });
}

exports.getTourOverview = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker'
    });
}