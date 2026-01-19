// Updated startTimer method to include auto cleanup for Timer issue

startTimer() {
    this.remainingSeconds = 1200; // assuming 20 minutes timeout
    this.cleanupInterval = setInterval(() => {
        if (this.remainingSeconds === 0) {
            this.executeFullReset();
        }
    }, 60000); // check every minute

    // Rest of the existing startTimer logic
}

loadData() {
    // existing logic to load data
    if (this.isDataExpired()) {
        this.executeFullReset(); // call executeFullReset instead of clearData
    }
}