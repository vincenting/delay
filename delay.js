'use strict';
!function (window) {

    var Delay = window.Delay = function () {
        this._init.apply(this, arguments);
    };

    var fn = Delay.prototype;

    fn._init = function () {
        // sign for whether queue has run.
        this._started = false;
        this._delayMap = {};
        // index map for finding task by taskId.
        this._taskIdIndex = {};
    };

    // generate unique id
    fn._uniqueId = function () {
        var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        return randLetter + Date.now();
    };

    fn._startedNeeded = function (funcName) {
        if (!this._started) {
            throw Error('can not call ' + funcName + ' before delay started.')
        }
    };

    fn._notStartedNeeded = function (funcName) {
        if (this._started) {
            throw Error('can not call ' + funcName + ' after delay started.')
        }
    };

    // add task for delay queue.
    fn.add = function (duration, task) {
        this._notStartedNeeded('add');
        var taskId;
        while (true) {
            taskId = this._uniqueId();
            if (!this._taskIdIndex.hasOwnProperty(taskId)) {
                break;
            }
        }
        this._taskIdIndex[taskId] = duration;
        if (!this._delayMap.hasOwnProperty(duration)) {
            this._delayMap[duration] = {};
        }
        this._delayMap[duration][taskId] = task;
        return taskId;
    };

    // remove task from delay queue.
    fn.remove = function (taskId) {
        this._notStartedNeeded('remove');
        // do nothing if taskId not find in index.
        if (!this._taskIdIndex.hasOwnProperty(taskId)) return;
        try {
            delete this._delayMap[this._taskIdIndex[taskId]][taskId];
            delete this._taskIdIndex[taskId];
        } catch (e) {
            // do nothing.
        }
    };

    // sorted tasks by duration
    fn._getSortedTasksQueue = function () {
        var resultQueue = [];
        for (var duration in this._delayMap) {
            if (this._delayMap.hasOwnProperty(duration)) {
                resultQueue[resultQueue.length] = {
                    duration: duration,
                    tasks: this._delayMap[duration]
                }
            }
        }
        return resultQueue.sort(function (pre, next) {
            return pre.duration - next.duration;
        });
    };

    fn._run = function () {
        var self = this;
        self._next = this.tasksQueue.shift();
        if (!self._next) return this._cb.fn && this._cb.fn.call(this._cb.context || this);
        self._timeout = setTimeout(function () {
            // run every tasks
            for (var taskId in self._next.tasks) {
                if (self._next.tasks.hasOwnProperty(taskId)) {
                    self._next.tasks[taskId]();
                }
            }
            self._pre = self._next;
            return self._run();
        }, self._next.duration - self._pre.duration);
    };

    // run delay queue.
    fn.run = function (cb, context) {
        this._notStartedNeeded('run');
        this._started = true;
        this.tasksQueue = this._getSortedTasksQueue();
        this._cb = {
            fn: cb,
            context: context
        };
        this._next = false;
        this._pre = {
            duration: 0
        };
        return this._run();
    };

    // pause a delay queue after run.
    fn.pause = function () {

    };

    // continue a delay if it has been paused.
    fn.cont = function () {

    };

    // stop and destroy delay.
    fn.destroy = function () {
        this._startedNeeded();
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = false;
        }
    };

}(window);