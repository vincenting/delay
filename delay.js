// Delay by vincent Ting.
// Open source with MIT.

'use strict';
!function (window) {

    var Delay = window.Delay = function () {
        this._init.apply(this, arguments);
    };

    var clearObject = function (o) {
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                delete o[i];
            }
        }
    };

    var fn = Delay.prototype;

    fn._init = function () {
        // sign for whether queue has run.
        this._started = false;
        this._delayMap = {};
        // index map for finding task by taskId.
        this._taskIdIndex = {};
        this._paused = false;
        this._lastingTime = 0;
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
    fn.add = function (duration, task, context) {
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
        this._delayMap[duration][taskId] = {fn: task, context: context};
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
        this._lastStartTime = Date.now();
        if (!self._next) return this._cb.fn && this._cb.fn.call(this._cb.context || this);
        self._timeout = setTimeout(function () {
            return self._runNext();
        }, self._next.duration - self._pre.duration);
    };

    fn._runNext = function () {
        // run every tasks
        for (var taskId in this._next.tasks) {
            if (this._next.tasks.hasOwnProperty(taskId)) {
                var t = this._next.tasks[taskId];
                t.fn.call(t.context || this);
            }
        }
        this._lastingTime = this._next.duration;
        this._pre = this._next;
        return this._run();
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
        this._startedNeeded('parse');
        if (this._paused) return;
        this._paused = true;
        this._lastingTime -= this._lastStartTime - Date.now();
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = false;
        }
    };

    // continue a delay if it has been paused.
    fn.cont = function () {
        var self = this;
        this._startedNeeded('cont');
        if (!this._paused) return;
        this._paused = false;
        this._lastStartTime = Date.now();
        this._timeout = setTimeout(function () {
            return self._runNext();
        }, this._next.duration - this._lastingTime);
    };

    // stop and destroy delay.
    fn.destroy = function () {
        this._started = false;
        this._paused = false;
        this._lastingTime = 0;
        clearObject(this._delayMap);
        clearObject(this._taskIdIndex);
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = false;
        }
    };

}(window);