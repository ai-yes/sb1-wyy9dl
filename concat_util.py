import os
import fnmatch
import sys
from typing import List, Set
from pathlib import Path

class FileConcatenator:
    # 默认支持的文件类型
    DEFAULT_EXTENSIONS = {
        # 网页和样式文件
        'html', 'htm', 'css', 
        # JavaScript相关
        'js', 'jsx', 'ts', 'tsx', 
        # Python相关
        'py', 'pyw', 'pyx', 
        # Java相关
        'java', 'jsp', 'jspx',
        # 配置文件
        'yaml', 'yml', 'json', 'xml', 'toml', 'ini',
        # 文档文件
        'md', 'txt', 'rst', 'log',
        # 其他源代码
        'sh', 'bash', 'sql', 'go', 'rs', 'rb', 'php'
    }

    # 默认排除的文件
    DEFAULT_EXCLUDE_PATTERNS = [
        # 常见需要排除的目录
        'node_modules/*',  # Node.js 模块
        'src/test/*',      # 测试目录
        '*.min.js',        # 压缩的JS文件
        '.git/*',          # Git目录
        '__pycache__/*',   # Python缓存
        '.env/*',          # 虚拟环境
        'dist/*',          # 构建目录
        'build/*',         # 构建目录
        'venv/*',          # Python虚拟环境
        '.idea/*',         # IDE配置
        '.vscode/*',       # VSCode配置
        # 当前脚本和输出文件
        'concat_util.py',   # 当前脚本可能的名称1
        'file_concat.py',   # 当前脚本可能的名称2
        'concatenated_output.txt',  # 默认输出文件
        'package-lock.json',
    ]

    def __init__(self, 
                 extensions: Set[str] = None, 
                 exclude_patterns: List[str] = None,
                 output_file: str = "concatenated_output.txt",
                 show_tree: bool = True):
        """
        初始化文件拼接器
        
        Args:
            extensions: 需要处理的文件扩展名集合，如果为None则使用默认值
            exclude_patterns: 要排除的文件/目录模式列表
            output_file: 输出文件名
            show_tree: 是否显示目录树结构
        """
        self.extensions = extensions or self.DEFAULT_EXTENSIONS
        # 合并用户提供的排除模式和默认排除模式
        user_patterns = exclude_patterns or []
        self.exclude_patterns = list(set(self.DEFAULT_EXCLUDE_PATTERNS + user_patterns))
        self.output_file = output_file
        # 将输出文件添加到排除列表中
        self.exclude_patterns.append(self.output_file)
        # 将当前脚本文件添加到排除列表中
        current_script = os.path.basename(sys.argv[0])
        if current_script not in self.exclude_patterns:
            self.exclude_patterns.append(current_script)
        
        self.show_tree = show_tree

    def should_process_path(self, path: str) -> bool:
        """
        判断路径（文件或目录）是否应该被处理
        """
        # 统一路径分隔符
        path = path.replace('\\', '/')
        return not any(fnmatch.fnmatch(path, pattern) for pattern in self.exclude_patterns)

    def should_process_file(self, file_path: str) -> bool:
        """
        判断文件是否应该被处理（包含在内容拼接中）
        """
        # 首先检查是否应该处理这个路径
        if not self.should_process_path(file_path):
            return False
            
        # 然后检查文件扩展名
        return any(file_path.endswith(f'.{ext}') for ext in self.extensions)

    def generate_tree(self, directory: str = '.', prefix: str = '', first: bool = True) -> str:
        """
        生成目录树结构的字符串表示
        
        Args:
            directory: 要处理的目录路径
            prefix: 当前行的前缀（用于缩进）
            first: 是否是第一次调用（根目录）
        
        Returns:
            str: 目录树的字符串表示
        """
        tree_str = []
        if first:
            tree_str.append("Directory Structure:")
            tree_str.append("==================")
            base_name = os.path.basename(os.path.abspath(directory))
            tree_str.append(f"📁 {base_name}")
            
        # 获取目录内容并排序
        items = sorted(os.listdir(directory))
        directories = []
        files = []
        
        # 分离文件和目录
        for item in items:
            full_path = os.path.join(directory, item)
            rel_path = os.path.relpath(full_path, directory if first else os.path.dirname(directory))
            
            if not self.should_process_path(rel_path):
                continue
                
            if os.path.isdir(full_path):
                directories.append(item)
            else:
                files.append(item)

        # 处理所有目录
        for i, dir_name in enumerate(directories):
            is_last_dir = (i == len(directories) - 1 and len(files) == 0)
            current_prefix = "└── " if is_last_dir else "├── "
            next_prefix = "    " if is_last_dir else "│   "
            
            full_path = os.path.join(directory, dir_name)
            tree_str.append(f"{prefix}{current_prefix}📁 {dir_name}")
            
            # 递归处理子目录
            tree_str.append(self.generate_tree(full_path, prefix + next_prefix, False))

        # 处理所有文件
        for i, file_name in enumerate(files):
            is_last = (i == len(files) - 1)
            current_prefix = "└── " if is_last else "├── "
            
            # 根据文件类型选择图标
            if self.should_process_file(file_name):
                icon = "📄"  # 将被处理的文件
            else:
                icon = "📎"  # 不会被处理的文件
                
            tree_str.append(f"{prefix}{current_prefix}{icon} {file_name}")

        return "\n".join(tree_str) if first else "\n".join(tree_str[1:])

    def concatenate_files(self, directory: str = '.'):
        """
        拼接指定目录下的所有符合条件的文件
        
        Args:
            directory: 要处理的目录路径
        """
        try:
            with open(self.output_file, 'w', encoding='utf-8') as output:
                # 首先写入目录树结构
                if self.show_tree:
                    tree_structure = self.generate_tree(directory)
                    output.write(tree_structure)
                    output.write("\n\n")
                    output.write("File Contents:")
                    output.write("\n==================\n\n")
                
                # 然后写入文件内容
                files_processed = 0
                total_size = 0
                
                for root, _, files in os.walk(directory):
                    for file in sorted(files):  # 排序文件以保持一致的顺序
                        file_path = os.path.join(root, file)
                        rel_path = os.path.relpath(file_path, directory)
                        
                        if not self.should_process_file(rel_path):
                            continue

                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                output.write(f"====={rel_path}=====\n")
                                output.write(content)
                                output.write("\n\n")
                                
                                files_processed += 1
                                total_size += len(content)
                                
                        except Exception as e:
                            print(f"Error processing {file_path}: {str(e)}")
                
                # 写入统计信息
                output.write("\n==================\n")
                output.write("Summary:\n")
                output.write(f"Total files processed: {files_processed}\n")
                output.write(f"Total content size: {total_size} characters\n")
                
            print(f"Successfully processed {files_processed} files.")
            print(f"Output written to: {self.output_file}")
            
        except Exception as e:
            print(f"Error writing output file: {str(e)}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Concatenate file contents with directory tree structure.')
    parser.add_argument('--directory', '-d', default='.', help='Directory to process (default: current directory)')
    parser.add_argument('--output', '-o', default='concatenated_output.txt', help='Output file name')
    parser.add_argument('--extensions', '-e', nargs='+', help='File extensions to process (space-separated)')
    parser.add_argument('--exclude', '-x', nargs='+', help='Additional patterns to exclude (space-separated)')
    parser.add_argument('--no-tree', action='store_true', help='Disable directory tree display')
    
    args = parser.parse_args()

    # 创建FileConcatenator实例
    concatenator = FileConcatenator(
        extensions=set(args.extensions) if args.extensions else None,
        exclude_patterns=args.exclude,
        output_file=args.output,
        show_tree=not args.no_tree
    )
    
    # 执行拼接
    concatenator.concatenate_files(args.directory)

if __name__ == "__main__":
    main()