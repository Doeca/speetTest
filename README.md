# 蓝盟免试作业

## 题目概述
> **核心任务是:选择合适的工具，独立编写相应的代码，完成HTTP协议下的测速平台并体现前后端分离的思想。**

## 开发思路
### 1. 确定测速原理
 1. 构建一个已知大小的包测传输时间
 2. 构建无尽包测过去一秒的传输量
 考虑到国内常见服务器的带宽，方案一会受制于服务器的上传带宽，故选择方案2
### 2. 确定开发工具
 1. nodeJs
### 3. 开发中遇到的问题
#### 问题一：关于测速原理的疑问
纵观市面上一众的测速软件，例如SpeedTest、Netflix的测速都使用了不间断发送大量数据包的形式得到平均速度，分析这种模式，可以发现一个弊端就是对测速服务器的带宽要求很大（当然这样测速也是最精准的），想要测出精准的速度，那么测速服务器的上行带宽需要大于客户机的下行带宽，测速服务器的下行带宽需要大于客户机的上行带宽，对于国内云服务器市场普遍10Mbps之内的水管，用这种方法测速显然就测不出精确的数值。

那么对于本次任务显然就需要换一种方案：小数据包测下载时间。

经过几次尝试之后发现了该方案的弊端：数据误差太大了。

对于普通的1Mbps上行的服务器，其瞬时最大速度就只有128kb/s，那么服务器的数据包就得小于这个数据量，但是对于大带宽的客户机，下载128kb的时间过短，可能要不了1ms，那么算出来的数据就过大了。

因此我针对服务器的最大上行带宽，设计了数据包。
![100kb/s数据包](https://cdn.doeca.cc/image/2021-10-06-22-13-58.png)

#### 问题二：数据包过大时server端收不到事件
经调查是因为：
>  send()适用于已连接的数据报或流式套接口发送数据。对于数据报类套接口，必需注意发送数据长度不应超过通讯子网的IP包最大长度。IP包最大长度在WSAStartup()调用返回的WSAData的iMaxUdpDg元素中。如果数据太长无法自动通过下层协议，则返回WSAEMSGSIZE错误，数据不会被发送。 请注意成功地完成send()调用并不意味着数据传送到达。 如果传送系统的缓冲区空间不够保存需传送的数据，除非套接口处于非阻塞I/O方式，否则send()将阻塞。

于是我调小了数据包，如何增大缓存区暂时找不到解决方案。

### 问题三：传统xhr模式的弊端
使用xhr，客户机便难以获取server上的内容，而且进行上行带宽的测速也较为麻烦，故使用socket更便捷，通过socket.io定义不同的事件，便可轻松地互通数据。
![server端获取ping值](https://cdn.doeca.cc/image/2021-10-06-22-22-31.png)

## 开发收获
经过本次任务的开发，我对网络数据包交换的协议有了更深的思考，对市面上看似简单的测速工具有了新的看法。并且熟悉了网页端与server的socket交互。