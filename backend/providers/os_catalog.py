from typing import List, Dict

# Standardized OS Catalog
# We map internal IDs to Provider-specific IDs

class OSCatalogItem:
    def __init__(self, id: str, name: str, type: str, provider_os_id: any, provider: str):
        self.id = id
        self.name = name
        self.type = type # 'windows' or 'linux'
        self.provider_os_id = provider_os_id
        self.provider = provider # 'vultr' for windows, 'contabo' for linux in this hybrid setup

# This catalog assumes split logic: Vultr for Windows, Contabo for Linux
# If we wanted multi-provider for same OS, we'd need more complex logic.

OS_CATALOG: List[OSCatalogItem] = [
    # Windows (Vultr)
    OSCatalogItem("win-2022", "Windows Server 2022 Standard", "windows", 477, "vultr"),
    OSCatalogItem("win-2019", "Windows Server 2019 Standard", "windows", 371, "vultr"),
    OSCatalogItem("win-2016", "Windows Server 2016 Standard", "windows", 240, "vultr"),
    
    # Linux (Contabo) - Image IDs need verification against Contabo API, assuming standard slugs
    OSCatalogItem("ubuntu-22.04", "Ubuntu 22.04 LTS", "linux", "ubuntu-22.04", "contabo"),
    OSCatalogItem("ubuntu-24.04", "Ubuntu 24.04 LTS (Noble Numbat)", "linux", "ubuntu-24.04", "contabo"),
    OSCatalogItem("debian-11", "Debian 11 (Bullseye)", "linux", "debian-11", "contabo"),
    OSCatalogItem("debian-12", "Debian 12 (Bookworm)", "linux", "debian-12", "contabo"),
    OSCatalogItem("centos-7-panel", "CentOS 7 + cPanel (License Req)", "linux", "centos-7-cpanel", "contabo"),
]

def get_os_by_id(os_id: str) -> OSCatalogItem:
    return next((os for os in OS_CATALOG if os.id == os_id), None)

def get_os_list_by_type(os_type: str) -> List[Dict]:
    return [
        {"id": os.id, "name": os.name, "provider": os.provider} 
        for os in OS_CATALOG if os.type == os_type
    ]
