from PyQt5.QtCore import pyqtSignal, QThread, Qt, QObject
from PyQt5.QtWidgets import QWidget, QLabel, QVBoxLayout, QListWidget, QListWidgetItem, QFrame
from PyQt5.QtGui import QFont, QPainter, QColor


class SignalHandler(QObject):
    record_added = pyqtSignal(str, str, str, str)


class BubbleFrame(QFrame):
    def __init__(self, text):
        super().__init__()
        self.text = text

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing, True)

        bubble_color = QColor("#a8dadc")  # Light blue color, you can change it
        painter.setBrush(bubble_color)
        painter.setPen(bubble_color)

        rect = self.rect().adjusted(0, 0, -1, -1)
        painter.drawRoundedRect(rect, 10, 10)

        painter.setPen(QColor("#1d3557"))  # Dark blue color, you can change it
        painter.drawText(rect, 0, self.text)


class ServerWindow(QWidget):
    record_added = pyqtSignal(str, str, str, str)

    def __init__(self):
        super().__init__()

        self.setWindowTitle("Server Window")
        self.setGeometry(100, 100, 700, 500)

        self.server_status_label = QLabel("Server is started")
        self.server_status_label.setFont(QFont("Arial", 14, QFont.Bold))

        self.record_label = QLabel("Records:")
        self.record_label.setFont(QFont("Arial", 12))

        self.records_list = QListWidget()

        self.main_layout = QVBoxLayout()
        self.main_layout.addWidget(self.server_status_label)
        self.main_layout.addWidget(self.record_label)
        self.main_layout.addWidget(self.records_list)

        # Start the server automatically when the window is opened
        self.start_server()

        self.setLayout(self.main_layout)

        # Create a thread for signal handling
        self.signal_thread = QThread(self)
        self.signal_handler = SignalHandler()
        self.signal_handler.moveToThread(self.signal_thread)

        # Connect the signal to the slot in the main thread
        self.signal_handler.record_added.connect(self.update_records, Qt.QueuedConnection)

        # Start the thread
        self.signal_thread.start()

    def start_server(self):
        # Your server start logic goes here
        # For example, you can start a thread or a separate process for the server

        # Simulating adding records for demonstration purposes
        self.add_record("192.168.1.1", 8080, 123, "Connected")
        self.add_record("192.168.1.2", 9090, 456, "Disconnected")

    def add_record(self, ip, port, socket_fd, status):
        record_text = f"IP: {ip}, PORT: {port}, SOCKET FD: {socket_fd}, Status: {status}"

        # Create a BubbleFrame for each record
        bubble_frame = BubbleFrame(record_text)
        item = QListWidgetItem(self.records_list)
        item.setSizeHint(bubble_frame.sizeHint())
        self.records_list.setItemWidget(item, bubble_frame)
        # Ensure the newly added item is visible
        self.records_list.scrollToBottom()

    def update_records(self, ip, port, socket_fd, status):
        self.add_record(ip, port, socket_fd, status)
        self.records_list.scrollToBottom()
