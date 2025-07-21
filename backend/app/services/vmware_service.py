# app/services/vmware_service.py

from pyVim.connect import SmartConnect, Disconnect
from pyVmomi import vim
import ssl

def get_last_events(host, user, pwd, limit=100):
    ctx = ssl._create_unverified_context()
    si = SmartConnect(
        protocol='https',
        host=host,
        user=user,
        pwd=pwd,
        port=443,
        sslContext=ctx
    )
    em = si.content.eventManager

    spec = vim.event.EventFilterSpec()
    spec.maxCount = limit
    collector = em.CreateCollectorForEvents(spec)

    events = []
    events.extend(collector.latestPage)
    while len(events) < limit:
        prev = collector.ReadPreviousEvents(limit - len(events))
        if not prev:
            break
        events[:0] = prev

    result = []
    for e in events[-limit:]:
        sever = getattr(e, "severity", "info").capitalize()
        result.append({
            "time": e.createdTime.isoformat(),
            "msg": e.fullFormattedMessage,
            "type": sever,
            "class": type(e).__name__
        })

    Disconnect(si)
    return result
