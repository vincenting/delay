# Delay - 延时控制

连续 setTimeout：

	setTimeout(doSomething, 1000);
	setTimeout(doSomething, 2000);
	setTimeout(doSomething, 3000);
	
的替代方案。

    var delay = new Delay();
    delay.add(1000, doSomething);
    delay.add(2000, doSomething);
    delay.add(3000, doSomething);
    delay.run(onFinishAll, context);
    
### 优势

* 全程单个 setTimeout 执行
* 执行前支持根据 taskId 删除已添加任务
* 支持全局暂停, 继续, 销毁任务的操作

### 简要文档

#### 1. 开始 new Delay

	var delay = new Delay

初始化一个 Delay 实例。

#### 2. 新建延时任务

	var taskId = delay.add(1000, doSometing)
	
新建定时任务，这里就是 1秒后执行 doSometing，这里的 doSometing 可以是给某元素增加 class 或者 删除 class，返回任务 ID。

#### 删除延时任务

	delay.remove(taskId);
	
执行前可以根据 ID 删除已注册任务。

#### 执行任务列表

	delay.run(onAllTasksFinished, context);
	
执行延时任务，并设置完成回调。其中 context 参数可选，为当前回调函数的上下文，默认为 Delay 实例。

#### 暂停执行

	delay.pause();

暂停当前延时队列的执行。

#### 继续执行

	delay.conti();
	
暂停后继续执行当前延时队列。

#### 销毁任务

	delay.destroy();
	
销毁当前延时队列。

- - -

采用 MIT 协议开源，have fun。